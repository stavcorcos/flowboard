'use client'
import { useState } from 'react'
import { Ticket, TimeBlock, WEEK_HOURS } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  tickets: Ticket[]
  onTicketClick: (t: Ticket) => void
  onBlockCreate: (ticketId: string, date: string, startHour: number, duration: number) => Promise<void>
  onBlockDelete: (blockId: string) => Promise<void>
}

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const HOUR_HEIGHT = 52

function getWeekDays(anchor: Date): Date[] {
  const d = new Date(anchor)
  d.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return x
  })
}

function toDateStr(d: Date) { return d.toISOString().slice(0, 10) }

function formatHour(h: number) {
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h > 12 ? h - 12 : h}${ampm}`
}

export default function WeekView({ tickets, onTicketClick, onBlockCreate, onBlockDelete }: Props) {
  const today = new Date()
  const [anchor, setAnchor] = useState(new Date(today))
  const [dragging, setDragging] = useState<{ date: string; startHour: number } | null>(null)
  const [dragEndHour, setDragEndHour] = useState(10)
  const [showPicker, setShowPicker] = useState<{ date: string; startHour: number } | null>(null)
  const [pickerTicketId, setPickerTicketId] = useState('')

  const weekDays = getWeekDays(anchor)
  const monthLabel = weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevWeek() { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d) }
  function nextWeek() { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d) }

  function hourFromY(el: HTMLElement, clientY: number) {
    const rect = el.getBoundingClientRect()
    return Math.round((WEEK_HOURS[0] + (clientY - rect.top) / HOUR_HEIGHT) * 2) / 2
  }

  function getBlocksForDay(date: string): Array<TimeBlock & { ticket: Ticket }> {
    return tickets.flatMap(t =>
      (t.timeBlocks ?? []).filter(b => b.date === date).map(b => ({ ...b, ticket: t }))
    ).sort((a, b) => a.startHour - b.startHour)
  }

  function getDueTicketsForDay(date: string) {
    return tickets.filter(t => t.dueDate?.slice(0, 10) === date)
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>, date: string) {
    if ((e.target as HTMLElement).closest('[data-block]')) return
    const grid = e.currentTarget.querySelector<HTMLElement>('[data-grid]')
    if (!grid) return
    const startHour = hourFromY(grid, e.clientY)
    setDragging({ date, startHour })
    setDragEndHour(startHour + 1)
    setShowPicker(null)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging) return
    const grid = e.currentTarget.querySelector<HTMLElement>('[data-grid]')
    if (!grid) return
    setDragEndHour(Math.max(dragging.startHour + 0.5, hourFromY(grid, e.clientY)))
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement>, date: string) {
    if (!dragging) return
    setShowPicker({ date, startHour: dragging.startHour })
    setDragging(null)
  }

  async function submitBlock() {
    if (!showPicker || !pickerTicketId) return
    const duration = Math.max(0.5, Math.round((dragEndHour - showPicker.startHour) * 2) / 2)
    await onBlockCreate(pickerTicketId, showPicker.date, showPicker.startHour, duration)
    setShowPicker(null)
    setPickerTicketId('')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden surface-base">

      {/* Week toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 border-b border-token">
        <span className="font-display text-sm font-bold text-primary">{monthLabel}</span>
        <div className="flex items-center gap-1.5">
          <button onClick={prevWeek} className="week-nav-btn">‹</button>
          <button onClick={() => setAnchor(new Date())} className="btn-accent">Today</button>
          <button onClick={nextWeek} className="week-nav-btn">›</button>
          {/* Legend — hidden on small screens */}
          <div className="hidden md:flex items-center gap-3 ml-3 text-[10px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm border-l-2" style={{ borderColor: 'var(--accent)', background: 'var(--accent-bg)' }} />
              Work block
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-1 rounded-sm" style={{ background: 'var(--due-color)' }} />
              Due date
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Hour gutter */}
        <div className="flex-shrink-0 w-10 sm:w-12 pt-9 border-r border-token">
          {WEEK_HOURS.map(h => (
            <div key={h} style={{ height: HOUR_HEIGHT }} className="flex items-start justify-end pr-2 pt-1">
              <span className="text-[9px] text-muted">{formatHour(h)}</span>
            </div>
          ))}
        </div>

        {/* Day columns — scroll horizontally on mobile, expand on desktop */}
        <div className="flex flex-1 overflow-x-auto">
          {weekDays.map(day => {
            const dateStr = toDateStr(day)
            const isToday = toDateStr(today) === dateStr
            const blocks = getBlocksForDay(dateStr)
            const dueTickets = getDueTicketsForDay(dateStr)
            const isDue = dueTickets.length > 0

            return (
              <div key={dateStr}
                className="flex-1 min-w-[72px] sm:min-w-[90px] flex flex-col border-r border-token-subtle"
                onMouseDown={e => handleMouseDown(e, dateStr)}
                onMouseMove={handleMouseMove}
                onMouseUp={e => handleMouseUp(e, dateStr)}>

                {/* Day header */}
                <div className={`h-9 flex flex-col items-center justify-center flex-shrink-0 border-b ${isDue ? 'border-[color:var(--due-border)]' : 'border-token'} ${isToday ? 'bg-[color:var(--accent-bg)]' : ''}`}>
                  <span className={`text-[9px] font-semibold uppercase tracking-widest ${isToday ? 'text-accent' : 'text-muted'}`}>
                    {DAY_LABELS[day.getDay()]}
                  </span>
                  <span className={`text-[13px] font-bold ${isToday ? 'text-accent' : 'text-primary'}`}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Grid */}
                <div className="relative flex-1 cursor-crosshair" data-grid>

                  {/* Hour lines */}
                  {WEEK_HOURS.map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-token-subtle" style={{ top: i * HOUR_HEIGHT }} />
                  ))}

                  {/* Due stripe */}
                  {isDue && (
                    <div className="absolute inset-0 pointer-events-none border-t-2" style={{ borderColor: 'var(--due-border)', background: 'var(--due-bg)' }}>
                      <div className="absolute bottom-1 right-1 text-[8px] font-bold" style={{ color: 'var(--due-color)' }}>
                        {dueTickets.map(t => t.title.slice(0, 12)).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Drag preview */}
                  {dragging?.date === dateStr && (
                    <div className="absolute left-0.5 right-0.5 rounded pointer-events-none border border-dashed border-[color:var(--accent-border)] bg-[color:var(--accent-bg)]"
                      style={{
                        top: (dragging.startHour - WEEK_HOURS[0]) * HOUR_HEIGHT,
                        height: Math.max(0.5, dragEndHour - dragging.startHour) * HOUR_HEIGHT,
                      }} />
                  )}

                  {/* Time blocks */}
                  {blocks.map(b => {
                    const top = (b.startHour - WEEK_HOURS[0]) * HOUR_HEIGHT
                    const height = b.duration * HOUR_HEIGHT
                    return (
                      <div key={b.id} data-block
                        className="absolute left-0.5 right-0.5 rounded overflow-hidden cursor-pointer group"
                        style={{ top, height, background: `${b.ticket.labelColor}22`, borderLeft: `2px solid ${b.ticket.labelColor}` }}
                        onClick={e => { e.stopPropagation(); onTicketClick(b.ticket) }}>
                        <div className="p-1.5 h-full flex flex-col justify-between">
                          <span className="text-[9px] font-semibold leading-tight line-clamp-2" style={{ color: b.ticket.labelColor }}>
                            {b.ticket.title}
                          </span>
                          {height > 36 && (
                            <span className="text-[8px] opacity-60" style={{ color: b.ticket.labelColor }}>
                              {formatHour(b.startHour)} · {b.duration}h
                            </span>
                          )}
                        </div>
                        <button data-block
                          className="absolute top-0.5 right-0.5 hidden group-hover:flex w-4 h-4 rounded items-center justify-center text-[9px] bg-black/50 text-[#f0889f]"
                          onClick={async e => { e.stopPropagation(); await onBlockDelete(b.id) }}>
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Block picker modal */}
      {showPicker && (
        <div className="modal-overlay" onClick={() => setShowPicker(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <p className="font-display text-sm font-bold text-primary mb-1">Add work block</p>
            <p className="text-[11px] text-secondary mb-4">
              {showPicker.date} · {formatHour(showPicker.startHour)} · {Math.max(0.5, Math.round((dragEndHour - showPicker.startHour) * 2) / 2)}h
            </p>
            <label className="form-label">Ticket</label>
            <select value={pickerTicketId} onChange={e => setPickerTicketId(e.target.value)}
              className="input-dark mb-4" style={{ colorScheme: 'dark' }}>
              <option value="">Select a ticket…</option>
              {tickets.filter(t => t.status !== 'DONE').map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowPicker(null)} className="btn-ghost">Cancel</button>
              <button onClick={submitBlock} disabled={!pickerTicketId} className="btn-accent disabled:opacity-40">
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
