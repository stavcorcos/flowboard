import { config } from 'dotenv'
config({ path: '.env.local' })

import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.POSTGRES_URL_NON_POOLING })

function newId() { return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36) }

async function seed() {
  console.log('🌱 Seeding...')

  const projectId = 'default-project'
  await pool.query(`
    INSERT INTO projects (id, name, description, color)
    VALUES ($1, 'FlowBoard Demo', 'Default project', '#a59dff')
    ON CONFLICT (id) DO NOTHING
  `, [projectId])

  await pool.query('DELETE FROM time_blocks WHERE ticket_id IN (SELECT id FROM tickets WHERE project_id = $1)', [projectId])
  await pool.query('DELETE FROM tickets WHERE project_id = $1', [projectId])

  const tickets = [
    { title: 'Redesign onboarding flow',         status: 'IN_PROGRESS', priority: 'HIGH',     label: 'Design',    labelColor: '#a59dff', assignee: 'JL', assigneeColor: '#f0889f', dueDate: '2026-05-16', order: 0 },
    { title: 'Fix nav dropdown z-index',          status: 'BACKLOG',     priority: 'CRITICAL', label: 'Bug',       labelColor: '#f0889f', assignee: 'TK', assigneeColor: '#f5c26b', dueDate: '2026-05-20', order: 0 },
    { title: 'Integrate Stripe billing',          status: 'BACKLOG',     priority: 'MEDIUM',   label: 'Dev',       labelColor: '#7ab8f5', assignee: 'MR', assigneeColor: '#5ecba1', dueDate: '2026-05-25', order: 1 },
    { title: 'Build ticket filtering',            status: 'IN_PROGRESS', priority: 'CRITICAL', label: 'Dev',       labelColor: '#7ab8f5', assignee: 'MR', assigneeColor: '#5ecba1', dueDate: '2026-05-15', order: 1 },
    { title: 'A/B test hero headlines',           status: 'IN_PROGRESS', priority: 'MEDIUM',   label: 'Marketing', labelColor: '#f5c26b', assignee: 'TK', assigneeColor: '#f5c26b', dueDate: '2026-05-16', order: 2 },
    { title: 'Email template refresh',            status: 'REVIEW',      priority: 'HIGH',     label: 'Design',    labelColor: '#a59dff', assignee: 'JL', assigneeColor: '#f0889f', dueDate: '2026-05-13', order: 0 },
    { title: 'API keys — waiting on contract',    status: 'BLOCKED',     priority: 'CRITICAL', label: 'Blocked',   labelColor: '#f0889f', assignee: 'JL', assigneeColor: '#a59dff', dueDate: '2026-05-19', order: 0 },
    { title: 'Set up CI/CD pipeline',             status: 'DONE',        priority: 'MEDIUM',   label: 'Dev',       labelColor: '#5ecba1', assignee: 'MR', assigneeColor: '#5ecba1', dueDate: '2026-05-10', order: 0 },
  ]

  const ids = {}
  for (const t of tickets) {
    const id = newId()
    ids[t.title] = id
    await pool.query(
      `INSERT INTO tickets (id,title,status,priority,label,label_color,assignee,assignee_color,due_date,sort_order,project_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, t.title, t.status, t.priority, t.label, t.labelColor, t.assignee, t.assigneeColor, t.dueDate, t.order, projectId]
    )
  }

  // Seed time blocks: work sessions leading up to due dates
  const blocks = [
    { ticket: 'Redesign onboarding flow',  date: '2026-05-13', startHour: 9,  duration: 1.5 },
    { ticket: 'Redesign onboarding flow',  date: '2026-05-14', startHour: 10, duration: 1   },
    { ticket: 'Redesign onboarding flow',  date: '2026-05-15', startHour: 9,  duration: 2   },
    { ticket: 'Build ticket filtering',    date: '2026-05-13', startHour: 14, duration: 1   },
    { ticket: 'Build ticket filtering',    date: '2026-05-14', startHour: 13, duration: 2   },
    { ticket: 'A/B test hero headlines',   date: '2026-05-14', startHour: 11, duration: 1   },
    { ticket: 'A/B test hero headlines',   date: '2026-05-15', startHour: 15, duration: 1   },
    { ticket: 'Email template refresh',    date: '2026-05-12', startHour: 9,  duration: 2   },
  ]

  for (const b of blocks) {
    const ticketId = ids[b.ticket]
    if (!ticketId) continue
    await pool.query(
      `INSERT INTO time_blocks (id, ticket_id, date, start_hour, duration) VALUES ($1,$2,$3,$4,$5)`,
      [newId(), ticketId, b.date, b.startHour, b.duration]
    )
  }

  console.log(`✅ Seeded ${tickets.length} tickets and ${blocks.length} time blocks.`)
  await pool.end()
}

seed().catch(e => { console.error(e); process.exit(1) })
