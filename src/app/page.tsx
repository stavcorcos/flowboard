'use client'
import { useState, useEffect } from 'react'
import { Ticket, TicketStatus, TimeBlock } from '@/types'
import Topbar from '@/components/ui/Topbar'
import KanbanBoard from '@/components/board/KanbanBoard'
import WeekView from '@/components/calendar/WeekView'
import TicketModal from '@/components/modals/TicketModal'

type View = 'board' | 'week'

export default function HomePage() {
  const [view,          setView]          = useState<View>('board')
  const [tickets,       setTickets]       = useState<Ticket[]>([])
  const [loading,       setLoading]       = useState(true)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TicketStatus>('BACKLOG')

  useEffect(() => {
    fetch('/api/tickets')
      .then(r => r.json())
      .then(data => { setTickets(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function openNew(status: TicketStatus = 'BACKLOG') {
    setEditingTicket(null); setDefaultStatus(status); setModalOpen(true)
  }
  function openEdit(ticket: Ticket) { setEditingTicket(ticket); setModalOpen(true) }

  function handleSave(saved: Ticket) {
    setTickets(prev => prev.find(t => t.id === saved.id)
      ? prev.map(t => t.id === saved.id ? saved : t)
      : [saved, ...prev])
    setModalOpen(false)
  }
  function handleDelete(id: string) {
    setTickets(prev => prev.filter(t => t.id !== id))
    setModalOpen(false)
  }

  async function handleBlockCreate(ticketId: string, date: string, startHour: number, duration: number) {
    const res = await fetch('/api/time-blocks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, date, startHour, duration }),
    })
    const block: TimeBlock = await res.json()
    setTickets(prev => prev.map(t => t.id === ticketId
      ? { ...t, timeBlocks: [...(t.timeBlocks ?? []), block] }
      : t))
  }

  async function handleBlockDelete(blockId: string) {
    await fetch(`/api/time-blocks/${blockId}`, { method: 'DELETE' })
    setTickets(prev => prev.map(t => ({
      ...t, timeBlocks: (t.timeBlocks ?? []).filter(b => b.id !== blockId)
    })))
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden surface-base">
      <Topbar view={view} onViewChange={setView} onNewTicket={() => openNew()} />
      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted text-sm animate-pulse">Loading…</span>
          </div>
        ) : view === 'board' ? (
          <KanbanBoard tickets={tickets} onTicketsChange={setTickets} onCardClick={openEdit} onAddClick={openNew} />
        ) : (
          <WeekView tickets={tickets} onTicketClick={openEdit} onBlockCreate={handleBlockCreate} onBlockDelete={handleBlockDelete} />
        )}
      </main>
      {modalOpen && (
        <TicketModal ticket={editingTicket} defaultStatus={defaultStatus}
          onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={handleDelete} />
      )}
    </div>
  )
}
