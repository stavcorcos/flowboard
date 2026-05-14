import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import './globals.css'

const syne   = Syne({ subsets: ['latin'], weight: ['400','700','800'], variable: '--font-display' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'FlowBoard',
  description: 'Kanban board meets calendar. Built for creative teams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased surface-base text-primary">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
