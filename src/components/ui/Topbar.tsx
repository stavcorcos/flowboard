'use client'
import { useTheme } from '@/context/ThemeContext'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

type View = 'board' | 'week'

interface TeamMember {
  id: string
  name: string
  email: string
  avatarColor: string
  role: string
}

interface Props {
  view: View
  onViewChange: (v: View) => void
  onNewTicket: () => void
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Topbar({ view, onViewChange, onNewTicket }: Props) {
  const { theme, toggle } = useTheme()
  const { data: session } = useSession()
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.ok ? r.json() : [])
      .then(setMembers)
      .catch(() => {})
  }, [])

  async function removeMember(userId: string) {
    await fetch(`/api/team/${userId}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== userId))
  }

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 surface-panel border-b border-token flex-shrink-0">
      <span className="font-display text-base font-bold text-accent tracking-tight mr-1 sm:mr-2 whitespace-nowrap">
        ⬡ FlowBoard
      </span>

      <nav className="flex gap-1 flex-1">
        {(['board', 'week'] as View[]).map(v => (
          <button key={v} onClick={() => onViewChange(v)} className={`nav-tab capitalize ${view === v ? 'active' : ''}`}>
            {v === 'board' ? 'Board' : 'Week'}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Team member avatars */}
        <div className="hidden sm:flex items-center gap-1.5">
          {members.map(member => {
            const isCurrentUser = member.id === session?.user?.id
            return (
              <div key={member.id} className="relative group">
                <div
                  title={isCurrentUser ? `${member.name} (you)` : member.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 cursor-default select-none"
                  style={{
                    background: member.avatarColor,
                    outline: isCurrentUser ? `2px solid ${member.avatarColor}` : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {getInitials(member.name)}
                </div>
                {!isCurrentUser && (
                  <button
                    onClick={() => removeMember(member.id)}
                    title={`Remove ${member.name}`}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full hidden group-hover:flex items-center justify-center border border-token"
                    style={{ background: 'var(--bg-raised)', color: '#f0889f', fontSize: '9px', lineHeight: 1 }}
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Dark/light toggle */}
        <button onClick={toggle} aria-label="Toggle theme"
          className="btn-ghost w-8 h-8 flex items-center justify-center rounded-md text-base">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="btn-ghost hidden sm:block"
          title={`Sign out ${session?.user?.name ?? ''}`}
        >
          Sign out
        </button>

        <button onClick={onNewTicket} className="btn-accent whitespace-nowrap">
          + <span className="hidden sm:inline">New </span>Ticket
        </button>
      </div>
    </header>
  )
}
