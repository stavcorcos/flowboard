import { NextRequest, NextResponse } from 'next/server'
import { query, rowToProject, rowToTicket, newId } from '@/lib/db'

export async function GET() {
  try {
    const projectRows = await query('SELECT * FROM projects ORDER BY created_at ASC')
    const ticketRows  = await query('SELECT * FROM tickets ORDER BY sort_order ASC')

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
  try {
    const body = await req.json()
    const { name, description, color } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const id = newId()
    const result = await query(
      'INSERT INTO projects (id, name, description, color) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, name.trim(), description ?? null, color ?? '#7F77DD']
    )

    return NextResponse.json({ ...rowToProject(result.rows[0]), tickets: [] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
