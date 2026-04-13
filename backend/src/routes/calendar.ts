import { Router } from 'express';
import { generateIcsCalendar, generateDailyReviewEvents } from '../services/icsExport';
import { createOutlookEvent, deleteOutlookEvent, isOutlookConfigured } from '../services/outlookCalendar';
import { db } from '../db/schema';

const router = Router();

// GET /api/calendar/export.ics  – download all future tasks as .ics
router.get('/calendar/export.ics', (_req, res) => {
  const ics = generateIcsCalendar();
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sde-prep.ics"');
  res.send(ics);
});

// GET /api/calendar/daily-review.ics  – 30-day daily review events
router.get('/calendar/daily-review.ics', (_req, res) => {
  const ics = generateDailyReviewEvents(30);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sde-daily-review.ics"');
  res.send(ics);
});

// GET /api/calendar/status  – is Outlook configured?
router.get('/calendar/status', (_req, res) => {
  res.json({ configured: isOutlookConfigured() });
});

// POST /api/calendar/sync-task/:id  – sync a single task to Outlook
router.post('/calendar/sync-task/:id', async (req, res) => {
  if (!isOutlookConfigured()) {
    return res.status(400).json({ error: 'Outlook not configured. Set OUTLOOK_CLIENT_ID in .env' });
  }

  const task = db.prepare(`
    SELECT t.*, tp.name as topic_name
    FROM tasks t LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.id = ?
  `).get(req.params.id) as any;

  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (!task.due_date) return res.status(400).json({ error: 'Task has no due date' });

  try {
    const eventId = await createOutlookEvent({
      title: task.title,
      notes: task.notes,
      due_date: task.due_date,
      due_time: task.due_time,
      topic_name: task.topic_name,
    });

    db.prepare('UPDATE tasks SET calendar_event_id = ? WHERE id = ?').run(eventId, task.id);
    return res.json({ event_id: eventId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/calendar/sync-task/:id  – remove task from Outlook
router.delete('/calendar/sync-task/:id', async (req, res) => {
  const task = db.prepare('SELECT calendar_event_id FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task?.calendar_event_id) return res.status(404).json({ error: 'No calendar event for this task' });

  try {
    await deleteOutlookEvent(task.calendar_event_id);
    db.prepare('UPDATE tasks SET calendar_event_id = NULL WHERE id = ?').run(req.params.id);
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
