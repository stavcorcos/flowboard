import { NextRequest, NextResponse } from 'next/server'
import { query, rowToTimeBlock } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { date, startHour, duration } = body

    const result = await query(
      `UPDATE time_blocks SET
        date       = COALESCE($1::date, date),
        start_hour = COALESCE($2, start_hour),
        duration   = COALESCE($3, duration)
       WHERE id = $4 RETURNING *`,
      [date ?? null, startHour ?? null, duration ?? null, params.id]
    )

    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rowToTimeBlock(result.rows[0]))
  } catch (error) {
    console.error('PATCH /api/time-blocks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update time block' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM time_blocks WHERE id = $1', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/time-blocks/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 })
  }
}
