import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // Always allow NextAuth's own routes and the signup endpoint
      if (pathname.startsWith('/api/auth') || pathname === '/api/signup') return true

      // Redirect logged-in users away from auth pages
      if (isLoggedIn && pathname.startsWith('/auth')) {
        return Response.redirect(new URL('/', nextUrl))
      }

      // Require login for everything else
      if (!isLoggedIn && !pathname.startsWith('/auth')) return false

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
