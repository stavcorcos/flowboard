import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    `SELECT u.id, u.name, u.email, u.avatar_color, tm.role, tm.joined_at
     FROM team_members tm
     JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = $1
     ORDER BY tm.joined_at ASC`,
    [session.user.teamId]
  )

  return NextResponse.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    avatarColor: r.avatar_color,
    role: r.role,
    joinedAt: r.joined_at,
  })))
}
