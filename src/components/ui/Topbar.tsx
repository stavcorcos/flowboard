'use client'
import { useTheme } from '@/context/ThemeContext'

type View = 'board' | 'week'

interface Props {
  view: View
  onViewChange: (v: View) => void
  onNewTicket: () => void
}

export default function Topbar({ view, onViewChange, onNewTicket }: Props) {
  const { theme, toggle } = useTheme()

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
        {/* Avatars — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-1.5">
          {[['JL','#f0889f'],['MR','#5ecba1'],['TK','#f5c26b']].map(([i,c]) => (
            <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: c }}>{i}</div>
          ))}
        </div>

        {/* Dark/light toggle */}
        <button onClick={toggle} aria-label="Toggle theme"
          className="btn-ghost w-8 h-8 flex items-center justify-center rounded-md text-base">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button onClick={onNewTicket} className="btn-accent whitespace-nowrap">
          + <span className="hidden sm:inline">New </span>Ticket
        </button>
      </div>
    </header>
  )
}
