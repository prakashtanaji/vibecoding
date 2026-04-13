import {
  PublicClientApplication,
  DeviceCodeRequest,
} from '@azure/msal-node';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';

const TOKEN_CACHE_DIR = path.join(os.homedir(), '.sde-prep');
const TOKEN_CACHE_FILE = path.join(TOKEN_CACHE_DIR, 'token.json');

const SCOPES = ['Calendars.ReadWrite', 'offline_access'];
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

let pca: PublicClientApplication | null = null;

function getPca(): PublicClientApplication {
  if (pca) return pca;

  const clientId = process.env.OUTLOOK_CLIENT_ID;
  const tenantId = process.env.OUTLOOK_TENANT_ID ?? 'common';

  if (!clientId) {
    throw new Error('OUTLOOK_CLIENT_ID not set in .env');
  }

  pca = new PublicClientApplication({
    auth: { clientId, authority: `https://login.microsoftonline.com/${tenantId}` },
    cache: {
      cachePlugin: {
        beforeCacheAccess: async (ctx) => {
          if (fs.existsSync(TOKEN_CACHE_FILE)) {
            ctx.tokenCache.deserialize(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));
          }
        },
        afterCacheAccess: async (ctx) => {
          if (ctx.cacheHasChanged) {
            if (!fs.existsSync(TOKEN_CACHE_DIR)) fs.mkdirSync(TOKEN_CACHE_DIR, { recursive: true });
            fs.writeFileSync(TOKEN_CACHE_FILE, ctx.tokenCache.serialize());
          }
        },
      },
    },
  });

  return pca;
}

async function getAccessToken(): Promise<string> {
  const app = getPca();

  // Try silent first (cached token)
  const accounts = await app.getTokenCache().getAllAccounts();
  if (accounts.length > 0) {
    try {
      const result = await app.acquireTokenSilent({ scopes: SCOPES, account: accounts[0] });
      if (result?.accessToken) return result.accessToken;
    } catch {}
  }

  // Fall back to device code flow (user must visit URL and enter code)
  const deviceCodeRequest: DeviceCodeRequest = {
    scopes: SCOPES,
    deviceCodeCallback: (response) => {
      console.log('\n=== Outlook Calendar Auth ===');
      console.log(response.message);
      console.log('================================\n');
    },
  };

  const result = await app.acquireTokenByDeviceCode(deviceCodeRequest);
  if (!result?.accessToken) throw new Error('Failed to acquire Outlook token');
  return result.accessToken;
}

function graphRequest(method: string, path: string, token: string, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const options = {
      hostname: 'graph.microsoft.com',
      path: `/v1.0${path}`,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Graph API ${res.statusCode}: ${data}`));
        } else {
          try { resolve(data ? JSON.parse(data) : {}); }
          catch { resolve({}); }
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function createOutlookEvent(task: {
  title: string; notes?: string; due_date: string; due_time?: string | null; topic_name?: string;
}): Promise<string> {
  const token = await getAccessToken();
  const [year, month, day] = task.due_date.split('-').map(Number);

  let start: object;
  let end: object;

  if (task.due_time) {
    const [h, m] = task.due_time.split(':').map(Number);
    const startDt = new Date(year, month - 1, day, h, m);
    const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);
    start = { dateTime: startDt.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    end = { dateTime: endDt.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  } else {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    start = { date: dateStr };
    end = { date: dateStr };
  }

  const body = {
    subject: `📚 ${task.title}`,
    body: { contentType: 'text', content: [task.notes ?? '', task.topic_name ? `Topic: ${task.topic_name}` : ''].filter(Boolean).join('\n') },
    start,
    end,
    categories: ['SDE Prep'],
    reminderMinutesBeforeStart: 15,
    isReminderOn: true,
  };

  const result = await graphRequest('POST', '/me/events', token, body);
  return result.id as string;
}

export async function updateOutlookEvent(eventId: string, updates: Partial<{ title: string; due_date: string; due_time: string | null }>): Promise<void> {
  const token = await getAccessToken();
  const body: any = {};

  if (updates.title) body.subject = `📚 ${updates.title}`;
  if (updates.due_date) {
    const [year, month, day] = updates.due_date.split('-').map(Number);
    if (updates.due_time) {
      const [h, m] = updates.due_time.split(':').map(Number);
      const startDt = new Date(year, month - 1, day, h, m);
      const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);
      body.start = { dateTime: startDt.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
      body.end = { dateTime: endDt.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    }
  }

  await graphRequest('PATCH', `/me/events/${eventId}`, token, body);
}

export async function deleteOutlookEvent(eventId: string): Promise<void> {
  const token = await getAccessToken();
  await graphRequest('DELETE', `/me/events/${eventId}`, token);
}

export function isOutlookConfigured(): boolean {
  return !!process.env.OUTLOOK_CLIENT_ID;
}
