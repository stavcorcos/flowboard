import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, newId } from '@/lib/db'
import { seedNewTeam } from '@/lib/seed-team'

const AVATAR_COLORS = ['#a59dff', '#f0889f', '#5ecba1', '#f5c26b', '#7ab8f5']

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = newId()
    const teamId = newId()
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    // Team name derived from first name
    const firstName = name.trim().split(' ')[0]
    const teamName = `${firstName}'s Team`

    await query(
      'INSERT INTO users (id, name, email, password_hash, avatar_color) VALUES ($1,$2,$3,$4,$5)',
      [userId, name.trim(), normalizedEmail, passwordHash, avatarColor]
    )

    await query(
      'INSERT INTO teams (id, name) VALUES ($1,$2)',
      [teamId, teamName]
    )

    await query(
      'INSERT INTO team_members (id, team_id, user_id, role) VALUES ($1,$2,$3,$4)',
      [newId(), teamId, userId, 'OWNER']
    )

    // Auto-populate the new team with sample tickets for the next two weeks
    await seedNewTeam(teamId)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/signup error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
