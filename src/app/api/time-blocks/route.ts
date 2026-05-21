import { NextRequest, NextResponse } from 'next/server'
import { query, rowToTimeBlock, newId } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const ticketId = searchParams.get('ticketId')
    const date     = searchParams.get('date')
    const weekOf   = searchParams.get('weekOf')

    let result
    if (ticketId) {
      result = await query('SELECT * FROM time_blocks WHERE ticket_id = $1 ORDER BY date, start_hour', [ticketId])
    } else if (weekOf) {
      result = await query(
        'SELECT * FROM time_blocks WHERE date >= $1 AND date < $1::date + 7 ORDER BY date, start_hour',
        [weekOf]
      )
    } else if (date) {
      result = await query('SELECT * FROM time_blocks WHERE date = $1 ORDER BY start_hour', [date])
    } else {
      result = await query('SELECT * FROM time_blocks ORDER BY date, start_hour')
    }

    return NextResponse.json(result.rows.map(rowToTimeBlock))
  } catch (error) {
    console.error('GET /api/time-blocks error:', error)
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { ticketId, date, startHour, duration } = body

    if (!ticketId || !date || startHour === undefined || !duration) {
      return NextResponse.json({ error: 'ticketId, date, startHour, duration required' }, { status: 400 })
    }

    const id = newId()
    const result = await query(
      'INSERT INTO time_blocks (id, ticket_id, date, start_hour, duration) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, ticketId, date, startHour, duration]
    )

    return NextResponse.json(rowToTimeBlock(result.rows[0]), { status: 201 })
  } catch (error) {
    console.error('POST /api/time-blocks error:', error)
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 })
  }
}
