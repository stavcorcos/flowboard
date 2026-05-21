import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      avatarColor: string
      teamId: string
    }
  }

  interface User {
    avatarColor?: string
    teamId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    avatarColor?: string
    teamId?: string
  }
}
