import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/context/ThemeContext'
import { auth } from '@/auth'
import './globals.css'

const syne   = Syne({ subsets: ['latin'], weight: ['400','700','800'], variable: '--font-display' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'FlowBoard',
  description: 'Kanban board meets calendar. Built for creative teams.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased surface-base text-primary">
        <SessionProvider session={session}>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
