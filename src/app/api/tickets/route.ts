import { NextRequest, NextResponse } from 'next/server'
import { query, rowToTicket, rowToTimeBlock, newId } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const ticketResult = projectId
      ? await query(
          'SELECT * FROM tickets WHERE project_id = $1 AND team_id = $2 ORDER BY status, sort_order ASC',
          [projectId, session.user.teamId]
        )
      : await query(
          'SELECT * FROM tickets WHERE team_id = $1 ORDER BY status, sort_order ASC',
          [session.user.teamId]
        )

    const tickets = ticketResult.rows.map(rowToTicket)

    if (tickets.length === 0) return NextResponse.json([])

    const ids = tickets.map(t => t.id)
    const blockResult = await query(
      'SELECT * FROM time_blocks WHERE ticket_id = ANY($1::text[]) ORDER BY date, start_hour',
      [ids]
    )
    const blocks = blockResult.rows.map(rowToTimeBlock)

    return NextResponse.json(tickets.map(t => ({
      ...t,
      timeBlocks: blocks.filter(b => b.ticketId === t.id),
    })))
  } catch (error) {
    console.error('GET /api/tickets error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, status, priority, label, labelColor, dueDate, assignee, assigneeColor, projectId } = body

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const orderRes = await query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM tickets WHERE status = $1 AND team_id = $2',
      [status ?? 'BACKLOG', session.user.teamId]
    )
    const id = newId()
    const result = await query(
      `INSERT INTO tickets (id,title,description,status,priority,label,label_color,due_date,assignee,assignee_color,sort_order,project_id,team_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [id, title.trim(), description ?? null, status ?? 'BACKLOG', priority ?? 'MEDIUM',
       label ?? 'Task', labelColor ?? '#a59dff', dueDate ?? null,
       assignee ?? null, assigneeColor ?? null, orderRes.rows[0].next_order,
       projectId ?? null, session.user.teamId]
    )

    return NextResponse.json({ ...rowToTicket(result.rows[0]), timeBlocks: [] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tickets error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
