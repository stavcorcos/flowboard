'use client'

import { useState } from 'react'
import { Ticket } from '@/types'
import { getDaysInMonth, getFirstDayOfMonth, hexToRgba } from '@/lib/utils'

interface CalendarViewProps {
  tickets: Ticket[]
  onDayClick: (date: Date) => void
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView({ tickets, onDayClick }: CalendarViewProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function getTicketsForDay(day: number): Ticket[] {
    return tickets.filter(t => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="flex flex-col gap-3 h-full p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="font-display text-lg font-bold text-[#1a1830]">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg border border-black/10 text-xs text-[#7a7890] hover:bg-[#EEEDFE] hover:text-[#7F77DD] hover:border-[#7F77DD] transition-all"
          >
            ‹
          </button>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
            className="px-3 py-1.5 rounded-lg border border-[#7F77DD] text-xs font-semibold text-[#7F77DD] hover:bg-[#EEEDFE] transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg border border-black/10 text-xs text-[#7a7890] hover:bg-[#EEEDFE] hover:text-[#7F77DD] hover:border-[#7F77DD] transition-all"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-black/[0.06] rounded-xl overflow-hidden flex-1 min-h-0">
        {/* Day labels */}
        {DAY_LABELS.map(d => (
          <div key={d} className="bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7a7890] text-center">
            {d}
          </div>
        ))}

        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[#faf9ff] min-h-[80px]" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          const dayTickets = getTicketsForDay(day)

          return (
            <div
              key={day}
              onClick={() => onDayClick(new Date(year, month, day))}
              className={`bg-white min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-[#EEEDFE]/50 ${isToday ? 'bg-[#EEEDFE]' : ''}`}
            >
              <span className={`text-[11px] font-semibold block mb-1 ${isToday ? 'text-[#7F77DD] font-extrabold' : 'text-[#7a7890]'}`}>
                {day}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayTickets.slice(0, 3).map(t => (
                  <div
                    key={t.id}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded truncate"
                    style={{
                      background: hexToRgba(t.labelColor, 0.15),
                      color: t.labelColor,
                    }}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTickets.length > 3 && (
                  <span className="text-[9px] text-[#7a7890] pl-1">+{dayTickets.length - 3} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
