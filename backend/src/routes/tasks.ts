import { Router } from 'express';
import { db } from '../db/schema';
import { addDays, addWeeks, format, parseISO } from 'date-fns';

const router = Router();

// GET /api/tasks?date=YYYY-MM-DD  – tasks for a specific day (with subtasks)
router.get('/tasks', (req, res) => {
  const { date, topic_id, status } = req.query;

  let query = `
    SELECT t.*, GROUP_CONCAT(r.id) as resource_ids
    FROM tasks t
    LEFT JOIN resources r ON r.task_id = t.id
    WHERE t.parent_task_id IS NULL
  `;
  const params: any[] = [];

  if (date) {
    query += ' AND t.due_date = ?';
    params.push(date);
  }
  if (topic_id) {
    query += ' AND t.topic_id = ?';
    params.push(topic_id);
  }
  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }

  query += ' GROUP BY t.id ORDER BY CASE t.priority WHEN \'high\' THEN 0 WHEN \'medium\' THEN 1 ELSE 2 END, t.due_time';

  const tasks = db.prepare(query).all(...params) as any[];

  // Attach subtasks and resources to each task
  const enriched = tasks.map(task => enrichTask(task));
  res.json(enriched);
});

// GET /api/tasks/calendar-dates?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns dates that have tasks (for calendar highlighting)
router.get('/tasks/calendar-dates', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });

  const rows = db.prepare(`
    SELECT due_date, COUNT(*) as count,
           SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done
    FROM tasks
    WHERE due_date BETWEEN ? AND ? AND parent_task_id IS NULL
    GROUP BY due_date
  `).all(from, to) as any[];

  return res.json(rows);
});

// GET /api/tasks/:id
router.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json({ error: 'Not found' });
  return res.json(enrichTask(task));
});

// POST /api/tasks
router.post('/tasks', (req, res) => {
  const {
    topic_id, parent_task_id, title, notes,
    status, priority, due_date, due_time,
    recurrence_type, recurrence_days, recurrence_end_date
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  const result = db.prepare(`
    INSERT INTO tasks (topic_id, parent_task_id, title, notes, status, priority,
                       due_date, due_time, recurrence_type, recurrence_days, recurrence_end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    topic_id ?? null, parent_task_id ?? null, title, notes ?? '',
    status ?? 'todo', priority ?? 'medium',
    due_date ?? null, due_time ?? null,
    recurrence_type ?? 'none',
    recurrence_days ? JSON.stringify(recurrence_days) : null,
    recurrence_end_date ?? null
  );

  const newId = result.lastInsertRowid as number;

  // Generate recurring task instances if needed
  if (recurrence_type && recurrence_type !== 'none' && due_date) {
    generateRecurrences(newId, due_date, recurrence_type, recurrence_days ?? null, recurrence_end_date ?? null,
      topic_id ?? null, title, notes ?? '', priority ?? 'medium', due_time ?? null);
  }

  return res.status(201).json({ id: newId });
});

// PATCH /api/tasks/:id
router.patch('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json({ error: 'Not found' });

  const fields = ['topic_id', 'title', 'notes', 'status', 'priority', 'due_date', 'due_time',
    'recurrence_type', 'recurrence_days', 'recurrence_end_date', 'calendar_event_id'];

  const updates: string[] = [];
  const values: any[] = [];

  fields.forEach(f => {
    if (f in req.body) {
      updates.push(`${f} = ?`);
      values.push(f === 'recurrence_days' && Array.isArray(req.body[f])
        ? JSON.stringify(req.body[f])
        : req.body[f]);
    }
  });

  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });

  updates.push('updated_at = datetime(\'now\')');
  values.push(req.params.id);

  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return res.json({ ok: true });
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// GET /api/stats  – overall stats for header
router.get('/stats', (_req, res) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayStats = db.prepare(`
    SELECT COUNT(*) as total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done
    FROM tasks WHERE due_date = ? AND parent_task_id IS NULL
  `).get(today) as any;

  const overallStats = db.prepare(`
    SELECT COUNT(*) as total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done
    FROM tasks WHERE parent_task_id IS NULL
  `).get() as any;

  res.json({
    today: { total: todayStats.total ?? 0, done: todayStats.done ?? 0 },
    overall: { total: overallStats.total ?? 0, done: overallStats.done ?? 0 },
  });
});

// ─── helpers ─────────────────────────────────────────────────────

function enrichTask(task: any) {
  task.subtasks = db.prepare('SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY created_at').all(task.id) as any[];
  task.resources = db.prepare('SELECT * FROM resources WHERE task_id = ?').all(task.id) as any[];
  if (task.recurrence_days) {
    try { task.recurrence_days = JSON.parse(task.recurrence_days); } catch {}
  }
  return task;
}

function generateRecurrences(
  parentId: number, startDate: string, type: string, days: number[] | null,
  endDate: string | null, topicId: number | null, title: string,
  notes: string, priority: string, time: string | null
) {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : addDays(start, 90); // default 3 months
  const instances: Date[] = [];
  let cursor = type === 'daily' ? addDays(start, 1) : addWeeks(start, 1);

  while (cursor <= end && instances.length < 52) {
    if (type === 'custom' && days) {
      if (days.includes(cursor.getDay())) instances.push(cursor);
    } else {
      instances.push(cursor);
    }
    cursor = type === 'daily' ? addDays(cursor, 1) : addWeeks(cursor, 1);
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (topic_id, parent_task_id, title, notes, status, priority, due_date, due_time,
                       recurrence_type, recurrence_days, recurrence_end_date)
    VALUES (?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((dates: Date[]) => {
    dates.forEach(d => {
      stmt.run(topicId, parentId, title, notes, priority, format(d, 'yyyy-MM-dd'),
        time, type, days ? JSON.stringify(days) : null, endDate ?? null);
    });
  });

  insertMany(instances);
}

export default router;
