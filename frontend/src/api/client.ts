const BASE = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Tracks
  getTracks: () => request<any[]>('/tracks'),
  createTrack: (body: object) => request<any>('/tracks', { method: 'POST', body: JSON.stringify(body) }),
  updateTrack: (id: number, body: object) => request<any>(`/tracks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTrack: (id: number) => request<any>(`/tracks/${id}`, { method: 'DELETE' }),

  // Topics
  getTopic: (id: number) => request<any>(`/topics/${id}`),
  createTopic: (body: object) => request<any>('/topics', { method: 'POST', body: JSON.stringify(body) }),

  // Tasks
  getTasks: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<any[]>(`/tasks${qs ? '?' + qs : ''}`);
  },
  getTask: (id: number) => request<any>(`/tasks/${id}`),
  getCalendarDates: (from: string, to: string) =>
    request<any[]>(`/tasks/calendar-dates?from=${from}&to=${to}`),
  createTask: (body: object) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: number, body: object) =>
    request<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id: number) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),
  getStats: () => request<any>('/stats'),

  // Calendar
  calendarStatus: () => request<any>('/calendar/status'),
  syncTask: (id: number) => request<any>(`/calendar/sync-task/${id}`, { method: 'POST' }),
  unsyncTask: (id: number) => request<any>(`/calendar/sync-task/${id}`, { method: 'DELETE' }),
};
