import { Router } from 'express';
import { db } from '../db/schema';

const router = Router();

// GET /api/tracks  – all tracks with nested topics and progress
router.get('/tracks', (_req, res) => {
  const tracks = db.prepare('SELECT * FROM tracks ORDER BY sort_order').all() as any[];

  const tracks_with_topics = tracks.map(track => {
    const topics = getTopicsForTrack(track.id);
    const { done, total } = calcTrackProgress(track.id);
    return { ...track, topics, done_tasks: done, total_tasks: total, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  res.json(tracks_with_topics);
});

// GET /api/topics/:id  – single topic with tasks and resources
router.get('/topics/:id', (req, res) => {
  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.id) as any;
  if (!topic) return res.status(404).json({ error: 'Not found' });

  topic.resources = db.prepare('SELECT * FROM resources WHERE topic_id = ?').all(topic.id);
  topic.tasks = db.prepare('SELECT * FROM tasks WHERE topic_id = ? AND parent_task_id IS NULL').all(topic.id);

  const { done, total } = calcTopicProgress(topic.id);
  topic.done_tasks = done;
  topic.total_tasks = total;
  topic.progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return res.json(topic);
});

// GET /api/topics/:id/resources
router.get('/topics/:id/resources', (req, res) => {
  const resources = db.prepare('SELECT * FROM resources WHERE topic_id = ?').all(req.params.id);
  res.json(resources);
});

// POST /api/tracks – create a new company track
router.post('/tracks', (req, res) => {
  const { name, type, company, icon } = req.body;
  if (!name || !type || !company) {
    return res.status(400).json({ error: 'name, type, and company are required' });
  }
  if (!['faang', 'mid', 'startup'].includes(type)) {
    return res.status(400).json({ error: 'type must be faang, mid, or startup' });
  }
  const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM tracks').get() as any)?.m ?? -1;
  const result = db.prepare(`
    INSERT INTO tracks (name, type, company, icon, sort_order) VALUES (?, ?, ?, ?, ?)
  `).run(name, type, company, icon ?? '🏢', maxOrder + 1);
  return res.status(201).json({ id: result.lastInsertRowid });
});

// DELETE /api/tracks/:id – delete a user-added track
router.delete('/tracks/:id', (req, res) => {
  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id) as any;
  if (!track) return res.status(404).json({ error: 'Track not found' });
  db.prepare('DELETE FROM tracks WHERE id = ?').run(req.params.id);
  return res.json({ ok: true });
});

// PATCH /api/tracks/:id – update track name or icon
router.patch('/tracks/:id', (req, res) => {
  const { name, icon } = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  if (name) { updates.push('name = ?'); values.push(name); }
  if (icon) { updates.push('icon = ?'); values.push(icon); }
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
  values.push(req.params.id);
  db.prepare(`UPDATE tracks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return res.json({ ok: true });
});

// POST /api/topics – create a new topic
router.post('/topics', (req, res) => {
  const { track_id, parent_id, name, description, estimated_hours } = req.body;
  if (!track_id || !name) return res.status(400).json({ error: 'track_id and name required' });

  const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM topics WHERE track_id = ?').get(track_id) as any)?.m ?? -1;

  const result = db.prepare(`
    INSERT INTO topics (track_id, parent_id, name, description, sort_order, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(track_id, parent_id ?? null, name, description ?? '', maxOrder + 1, estimated_hours ?? 2);

  return res.status(201).json({ id: result.lastInsertRowid });
});

// ─── helpers ─────────────────────────────────────────────────────

function getTopicsForTrack(trackId: number) {
  const all = db.prepare('SELECT * FROM topics WHERE track_id = ? ORDER BY sort_order').all(trackId) as any[];
  const resourceMap = new Map<number, any[]>();
  const topicIds = all.map(t => t.id);

  if (topicIds.length > 0) {
    const placeholders = topicIds.map(() => '?').join(',');
    const resources = db.prepare(`SELECT * FROM resources WHERE topic_id IN (${placeholders})`).all(...topicIds) as any[];
    resources.forEach(r => {
      if (!resourceMap.has(r.topic_id)) resourceMap.set(r.topic_id, []);
      resourceMap.get(r.topic_id)!.push(r);
    });
  }

  const map = new Map<number, any>();
  all.forEach(t => {
    const { done, total } = calcTopicProgress(t.id);
    map.set(t.id, {
      ...t,
      resources: resourceMap.get(t.id) ?? [],
      children: [],
      done_tasks: done,
      total_tasks: total,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
    });
  });

  const roots: any[] = [];
  all.forEach(t => {
    if (t.parent_id) {
      map.get(t.parent_id)?.children.push(map.get(t.id));
    } else {
      roots.push(map.get(t.id));
    }
  });
  return roots;
}

function calcTopicProgress(topicId: number) {
  const row = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
    FROM tasks WHERE topic_id = ?
  `).get(topicId) as any;
  return { done: row.done ?? 0, total: row.total ?? 0 };
}

function calcTrackProgress(trackId: number) {
  const row = db.prepare(`
    SELECT
      COUNT(t.id) as total,
      SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done
    FROM tasks t
    JOIN topics tp ON t.topic_id = tp.id
    WHERE tp.track_id = ?
  `).get(trackId) as any;
  return { done: row.done ?? 0, total: row.total ?? 0 };
}

export default router;
