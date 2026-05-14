import { config } from 'dotenv'
config({ path: '.env.local' })

import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING })

async function setup() {
  console.log('🔧 Setting up tables...')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      color       TEXT NOT NULL DEFAULT '#7F77DD',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

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
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

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

  console.log('✅ Tables ready.')
  await pool.end()
}

setup().catch(e => { console.error(e); process.exit(1) })
