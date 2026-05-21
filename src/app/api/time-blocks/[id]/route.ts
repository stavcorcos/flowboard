import { NextRequest, NextResponse } from 'next/server'
import { query, rowToTimeBlock } from '@/lib/db'
import { auth } from '@/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { date, startHour, duration } = body

    const result = await query(
      `UPDATE time_blocks SET
        date       = COALESCE($1::date, date),
        start_hour = COALESCE($2, start_hour),
        duration   = COALESCE($3, duration)
       WHERE id = $4 RETURNING *`,
      [date ?? null, startHour ?? null, duration ?? null, id]
    )

    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rowToTimeBlock(result.rows[0]))
  } catch (error) {
    console.error('PATCH /api/time-blocks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update time block' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await query('DELETE FROM time_blocks WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/time-blocks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 })
  }
}
