import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { query } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const result = await query(
          `SELECT u.id, u.name, u.email, u.password_hash, u.avatar_color, tm.team_id
           FROM users u
           JOIN team_members tm ON u.id = tm.user_id
           WHERE u.email = $1
           LIMIT 1`,
          [email.toLowerCase().trim()]
        )

        const row = result.rows[0]
        if (!row) return null

        const valid = await bcrypt.compare(password, row.password_hash)
        if (!valid) return null

        return {
          id: row.id,
          email: row.email,
          name: row.name,
          avatarColor: row.avatar_color,
          teamId: row.team_id,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.avatarColor = (user as any).avatarColor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.teamId = (user as any).teamId
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.avatarColor = token.avatarColor as string
        session.user.teamId = token.teamId as string
      }
      return session
    },
  },
})
