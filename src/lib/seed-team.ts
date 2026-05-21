import { query, newId } from './db'

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const SAMPLE_TICKETS: {
  title: string
  status: string
  priority: string
  label: string
  labelColor: string
  dayOffset: number
  order: number
}[] = [
  { title: 'Project kick-off & planning',       status: 'DONE',        priority: 'HIGH',     label: 'Planning',  labelColor: '#5ecba1', dayOffset: 0,  order: 0 },
  { title: 'Set up repository & CI pipeline',   status: 'DONE',        priority: 'MEDIUM',   label: 'Dev',       labelColor: '#7ab8f5', dayOffset: 2,  order: 1 },
  { title: 'Design system & component library', status: 'IN_PROGRESS', priority: 'HIGH',     label: 'Design',    labelColor: '#a59dff', dayOffset: 4,  order: 0 },
  { title: 'Core API endpoints',                status: 'IN_PROGRESS', priority: 'CRITICAL', label: 'Dev',       labelColor: '#7ab8f5', dayOffset: 6,  order: 1 },
  { title: 'Authentication flow',               status: 'REVIEW',      priority: 'HIGH',     label: 'Dev',       labelColor: '#a59dff', dayOffset: 7,  order: 0 },
  { title: 'Dashboard & analytics page',        status: 'BACKLOG',     priority: 'MEDIUM',   label: 'Design',    labelColor: '#a59dff', dayOffset: 9,  order: 0 },
  { title: 'Mobile responsiveness audit',       status: 'BACKLOG',     priority: 'MEDIUM',   label: 'Bug',       labelColor: '#f0889f', dayOffset: 11, order: 1 },
  { title: 'Write user documentation',          status: 'BACKLOG',     priority: 'LOW',      label: 'Docs',      labelColor: '#5ecba1', dayOffset: 12, order: 2 },
  { title: 'Third-party integrations',          status: 'BLOCKED',     priority: 'HIGH',     label: 'Dev',       labelColor: '#f5c26b', dayOffset: 13, order: 0 },
  { title: 'Beta launch prep',                  status: 'BACKLOG',     priority: 'CRITICAL', label: 'Marketing', labelColor: '#f5c26b', dayOffset: 14, order: 3 },
]

export async function seedNewTeam(teamId: string) {
  const projectId = newId()
  await query(
    'INSERT INTO projects (id, name, description, color, team_id) VALUES ($1,$2,$3,$4,$5)',
    [projectId, 'My First Project', 'Getting started — edit or delete these sample tickets.', '#a59dff', teamId]
  )

  const ticketIds: Record<string, string> = {}
  for (const t of SAMPLE_TICKETS) {
    const id = newId()
    ticketIds[t.title] = id
    await query(
      `INSERT INTO tickets (id, title, status, priority, label, label_color, due_date, sort_order, project_id, team_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, t.title, t.status, t.priority, t.label, t.labelColor,
       dateOffset(t.dayOffset), t.order, projectId, teamId]
    )
  }

  // Seed a handful of time blocks so the Week view looks populated
  const timeBlocks = [
    { ticket: 'Design system & component library', dayOffset: 1, startHour: 9,  duration: 2   },
    { ticket: 'Design system & component library', dayOffset: 3, startHour: 10, duration: 1.5 },
    { ticket: 'Core API endpoints',                dayOffset: 2, startHour: 14, duration: 1.5 },
    { ticket: 'Core API endpoints',                dayOffset: 4, startHour: 13, duration: 2   },
    { ticket: 'Authentication flow',               dayOffset: 3, startHour: 11, duration: 1   },
    { ticket: 'Authentication flow',               dayOffset: 5, startHour: 9,  duration: 1.5 },
  ]

  for (const b of timeBlocks) {
    const ticketId = ticketIds[b.ticket]
    if (!ticketId) continue
    await query(
      'INSERT INTO time_blocks (id, ticket_id, date, start_hour, duration) VALUES ($1,$2,$3,$4,$5)',
      [newId(), ticketId, dateOffset(b.dayOffset), b.startHour, b.duration]
    )
  }
}
