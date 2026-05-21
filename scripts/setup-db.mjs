import { config } from 'dotenv'
config({ path: '.env.local' })

import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING })

async function setup() {
  console.log('🔧 Setting up tables...')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_color  TEXT NOT NULL DEFAULT '#a59dff',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id        TEXT PRIMARY KEY,
      team_id   TEXT NOT NULL,
      user_id   TEXT NOT NULL,
      role      TEXT NOT NULL DEFAULT 'MEMBER',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(team_id, user_id)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      color       TEXT NOT NULL DEFAULT '#7F77DD',
      team_id     TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Add team_id to existing projects table if upgrading
  await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id TEXT`)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      description    TEXT,
      status         TEXT NOT NULL DEFAULT 'BACKLOG',
      priority       TEXT NOT NULL DEFAULT 'MEDIUM',
      label          TEXT NOT NULL DEFAULT 'Task',
      label_color    TEXT NOT NULL DEFAULT '#a59dff',
      due_date       TIMESTAMPTZ,
      assignee       TEXT,
      assignee_color TEXT,
      sort_order     INT NOT NULL DEFAULT 0,
      project_id     TEXT REFERENCES projects(id) ON DELETE SET NULL,
      team_id        TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Add team_id to existing tickets table if upgrading
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS team_id TEXT`)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS time_blocks (
      id         TEXT PRIMARY KEY,
      ticket_id  TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      date       DATE NOT NULL,
      start_hour NUMERIC(4,1) NOT NULL DEFAULT 9,
      duration   NUMERIC(4,1) NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`CREATE INDEX IF NOT EXISTS time_blocks_ticket_idx ON time_blocks(ticket_id)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS time_blocks_date_idx ON time_blocks(date)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS tickets_team_idx ON tickets(team_id)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS projects_team_idx ON projects(team_id)`)

  console.log('✅ Tables ready.')
  await pool.end()
}

setup().catch(e => { console.error(e); process.exit(1) })
