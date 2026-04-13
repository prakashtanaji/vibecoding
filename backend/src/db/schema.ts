import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dataDir = process.env.DATA_DIR || './data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'sde-prep.db');
export const db = new Database(dbPath);

// Enable WAL for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('faang','mid','startup')),
      company TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🏢',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      estimated_hours INTEGER NOT NULL DEFAULT 2
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
      parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
      due_date TEXT,
      due_time TEXT,
      recurrence_type TEXT NOT NULL DEFAULT 'none' CHECK(recurrence_type IN ('none','daily','weekly','custom')),
      recurrence_days TEXT,
      recurrence_end_date TEXT,
      calendar_event_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'article' CHECK(type IN ('video','article','practice','course'))
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_topic ON tasks(topic_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_topics_track ON topics(track_id);
    CREATE INDEX IF NOT EXISTS idx_resources_topic ON resources(topic_id);
    CREATE INDEX IF NOT EXISTS idx_resources_task ON resources(task_id);
  `);
}
