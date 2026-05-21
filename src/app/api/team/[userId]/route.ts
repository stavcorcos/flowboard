import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await params

  if (userId === session.user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 400 })
  }

  await query(
    'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
    [session.user.teamId, userId]
  )

  return NextResponse.json({ success: true })
}
