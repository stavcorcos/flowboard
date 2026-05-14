# FlowBoard

Kanban board + calendar app. Built with Next.js 15, Tailwind CSS, TypeScript, and Vercel Postgres (raw SQL via `@vercel/postgres`).

---

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@vercel/postgres** — raw SQL, no ORM
- **@dnd-kit** — drag and drop

---

## Local Setup

### 1. Install

```bash
npm install
```

### 2. Environment variables

Go to your Vercel project → Settings → Environment Variables, then pull them locally:

```bash
# If you have the Vercel CLI:
npx vercel env pull .env.local

# Or manually copy .env.example → .env.local and fill in your Vercel Postgres values
```

### 3. Create tables

```bash
npm run db:setup
```

### 4. Seed sample data (optional)

```bash
npm run db:seed
```

### 5. Run

```bash
npm run dev
```

---

## Deploy to Vercel

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOU/flowboard.git
git push -u origin main
```

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List all tickets |
| POST | `/api/tickets` | Create a ticket |
| PATCH | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |

---

## DB Schema (raw SQL)

```sql
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#7F77DD',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tickets (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'BACKLOG',
  priority       TEXT NOT NULL DEFAULT 'MEDIUM',
  label          TEXT NOT NULL DEFAULT 'Task',
  label_color    TEXT NOT NULL DEFAULT '#7F77DD',
  due_date       TIMESTAMPTZ,
  assignee       TEXT,
  assignee_color TEXT,
  sort_order     INT NOT NULL DEFAULT 0,
  project_id     TEXT REFERENCES projects(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
