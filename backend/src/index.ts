import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSchema } from './db/schema';
import { seedIfEmpty } from './db/seed';
import tasksRouter from './routes/tasks';
import topicsRouter from './routes/topics';
import calendarRouter from './routes/calendar';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Initialize DB schema and seed on startup
initSchema();
seedIfEmpty();

// Routes
app.use('/api', tasksRouter);
app.use('/api', topicsRouter);
app.use('/api', calendarRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// JSON backup export
app.get('/api/backup', (_req, res) => {
  const { db } = require('./db/schema');
  const data = {
    exported_at: new Date().toISOString(),
    tracks: db.prepare('SELECT * FROM tracks').all(),
    topics: db.prepare('SELECT * FROM topics').all(),
    tasks: db.prepare('SELECT * FROM tasks').all(),
    resources: db.prepare('SELECT * FROM resources').all(),
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="sde-prep-backup.json"');
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`SDE Prep backend running at http://localhost:${PORT}`);
});

export default app;
