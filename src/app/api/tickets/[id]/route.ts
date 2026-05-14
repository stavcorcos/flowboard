import { NextRequest, NextResponse } from 'next/server'
import { query, rowToTicket } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, status, priority, label, labelColor, dueDate, assignee, assigneeColor, order } = body

    const result = await query(
      `UPDATE tickets SET
        title          = COALESCE($1,  title),
        description    = COALESCE($2,  description),
        status         = COALESCE($3,  status),
        priority       = COALESCE($4,  priority),
        label          = COALESCE($5,  label),
        label_color    = COALESCE($6,  label_color),
        due_date       = COALESCE($7::timestamptz, due_date),
        assignee       = COALESCE($8,  assignee),
        assignee_color = COALESCE($9,  assignee_color),
        sort_order     = COALESCE($10, sort_order),
        updated_at     = NOW()
       WHERE id = $11
       RETURNING *`,
      [title ?? null, description ?? null, status ?? null, priority ?? null,
       label ?? null, labelColor ?? null, dueDate ?? null,
       assignee ?? null, assigneeColor ?? null, order ?? null, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json(rowToTicket(result.rows[0]))
  } catch (error) {
    console.error('PATCH /api/tickets/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await query('DELETE FROM tickets WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tickets/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
  }
}
