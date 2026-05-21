import { NextRequest, NextResponse } from 'next/server'
import { query, rowToProject, rowToTicket, newId } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const projectRows = await query(
      'SELECT * FROM projects WHERE team_id = $1 ORDER BY created_at ASC',
      [session.user.teamId]
    )
    const ticketRows = await query(
      'SELECT * FROM tickets WHERE team_id = $1 ORDER BY sort_order ASC',
      [session.user.teamId]
    )

    const projects = projectRows.rows.map(p => ({
      ...rowToProject(p),
      tickets: ticketRows.rows.filter(t => t.project_id === p.id).map(rowToTicket),
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, color } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const id = newId()
    const result = await query(
      'INSERT INTO projects (id, name, description, color, team_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, name.trim(), description ?? null, color ?? '#7F77DD', session.user.teamId]
    )

    return NextResponse.json({ ...rowToProject(result.rows[0]), tickets: [] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
