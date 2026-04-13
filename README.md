# SDE Interview Prep — Task Manager

A local web app to plan, track, and complete your SDE interview preparation. Built with React + TypeScript (frontend) and Node.js + Express + SQLite (backend).

---

## Features

- **Company-specific tracks** — Pre-loaded roadmaps for Google, Meta, Amazon, Microsoft, Stripe, Airbnb, Uber, and Startups
- **Topic tree** — Collapsible sidebar with nested topics, subtopics, and live progress counts
- **Task management** — Create tasks with due date, time, priority, recurrence (daily/weekly/custom), and subtasks
- **Resource links** — Curated tutorials and practice links (NeetCode, ByteByteGo, LeetCode, William Fiset, etc.) attached to each topic
- **Daily list view** — See today's tasks alongside a mini calendar; click any day to view its tasks
- **Progress tracking** — Progress bars per topic, per track, and overall in the header
- **Calendar integration** — Export tasks as `.ics` (importable into any calendar app), or sync directly to Outlook via Microsoft Graph API
- **Daily review events** — Generate 30 days of recurring morning review events as `.ics`
- **Browser notifications** — Reminders 15 minutes before any scheduled task
- **Dark mode** + keyboard shortcut (`n` = new task)
- **JSON backup** — One-click full data export

---

## Project Structure

```
vibecoding/
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── api/            # API client (fetch wrappers)
│       ├── components/
│       │   ├── calendar/   # MiniCalendar
│       │   ├── layout/     # Header, Sidebar, DailyView
│       │   ├── shared/     # ProgressBar, ResourceLinks
│       │   ├── tasks/      # TaskCard, TaskForm
│       │   └── tracks/     # TrackTree (sidebar navigation)
│       ├── hooks/          # useNotifications, useKeyboardShortcuts
│       ├── stores/         # Zustand UI store (selectedDate, darkMode, etc.)
│       └── types/          # Shared TypeScript types
├── backend/                # Node.js + Express + TypeScript
│   └── src/
│       ├── db/             # SQLite schema + seed data
│       ├── routes/         # tasks, topics, calendar REST routes
│       └── services/       # Outlook Graph API, .ics export
├── .env.example            # Environment variable template
└── package.json            # Root scripts (runs both servers together)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/prakashtanaji/vibecoding.git
cd vibecoding

# 2. Install all dependencies (root + frontend + backend)
npm run install:all

# 3. Copy the env template
cp .env.example backend/.env

# 4. Start both servers
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

The SQLite database is created automatically at `backend/data/sde-prep.db` on first run and seeded with all tracks, topics, and resource links.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracks` | All tracks with nested topics and progress |
| GET | `/api/topics/:id` | Single topic with tasks and resources |
| GET | `/api/tasks?date=YYYY-MM-DD` | Tasks for a specific date |
| GET | `/api/tasks?topic_id=N` | Tasks for a topic |
| GET | `/api/tasks/calendar-dates?from=&to=` | Dates with tasks (for calendar dots) |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/stats` | Today's and overall completion stats |
| GET | `/api/calendar/export.ics` | Download all future tasks as .ics |
| GET | `/api/calendar/daily-review.ics` | 30-day daily review events as .ics |
| POST | `/api/calendar/sync-task/:id` | Sync task to Outlook Calendar |
| GET | `/api/backup` | Download full JSON backup |

---

## Outlook Calendar Integration

1. Register an app at [portal.azure.com](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
   - Platform: **Mobile and desktop applications**
   - Redirect URI: `http://localhost`
2. Copy your **Application (client) ID**
3. Add it to `backend/.env`:
   ```
   OUTLOOK_CLIENT_ID=your-client-id-here
   OUTLOOK_TENANT_ID=common
   ```
4. Restart the backend
5. Click the calendar icon on any task that has a due date — the backend will prompt a device-code login in the terminal on first use

---

## Pre-loaded SDE Tracks & Topics

### FAANG
| Company | Key Topics |
|---------|-----------|
| **Google** | DSA (Arrays, Trees, Graphs, DP), System Design (Caching, Databases, Microservices), Behavioral |
| **Meta** | Coding (Blind 75 / NeetCode), System Design (News Feed, Chat), Behavioral |
| **Amazon** | 14 Leadership Principles (per LP), Coding, System Design |
| **Microsoft** | Coding (medium/OO focus), System Design (Azure scale), Behavioral |

### Mid-tier
| Company | Key Topics |
|---------|-----------|
| **Stripe** | API Design, Payments & Distributed Systems, DSA |
| **Airbnb** | Frontend Engineering, Search/Booking Systems, DSA |
| **Uber** | Geo/Graph Algorithms, Real-time Systems, DSA |

### Startup General
- Generalist DSA, Full-Stack Fundamentals, CS Fundamentals (OS, Networking, Databases), Behavioral

---

## Key Resource Links (pre-seeded)

| Resource | Topics Covered |
|----------|---------------|
| [NeetCode 150](https://neetcode.io/) | All DSA patterns with free video solutions |
| [Blind 75](https://neetcode.io/practice/blind75) | Essential 75 LeetCode problems |
| [Grind 75](https://www.techinterviewhandbook.org/grind75/) | Customizable study plan |
| [ByteByteGo](https://bytebytego.com/) | System Design (visual, comprehensive) |
| [Grokking System Design](https://www.designgurus.io/course/grokking-the-system-design-interview) | System Design fundamentals |
| [William Fiset (YouTube)](https://www.youtube.com/@WilliamFiset-videos) | Graph algorithms, Data Structures |
| [karanpratapsingh/system-design](https://github.com/karanpratapsingh/system-design) | Free system design guide |
| [Amazon LP Guide](https://www.designgurus.io/blog/amazon-leadership-principles-behavioral-interview) | All 14 Leadership Principles |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand (UI), TanStack Query (server) |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite via `better-sqlite3` |
| Calendar | Microsoft Graph API (`@azure/msal-node`), `ical-generator` |
| Date utils | `date-fns` |

---

## License

MIT
