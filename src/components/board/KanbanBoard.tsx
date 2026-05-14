'use client'
import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
  DragStartEvent, DragOverEvent, DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Ticket, TicketStatus, STATUS_CONFIG } from '@/types'
import KanbanColumn from './KanbanColumn'

interface Props {
  tickets: Ticket[]
  onTicketsChange: (t: Ticket[]) => void
  onCardClick: (t: Ticket) => void
  onAddClick: (s?: TicketStatus) => void
}

export default function KanbanBoard({ tickets, onTicketsChange, onCardClick, onAddClick }: Props) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const getByStatus = useCallback(
    (s: TicketStatus) => tickets.filter(t => t.status === s).sort((a, b) => a.order - b.order),
    [tickets]
  )

  function handleDragStart(e: DragStartEvent) {
    setActiveTicket(tickets.find(t => t.id === e.active.id) ?? null)
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const at = tickets.find(t => t.id === active.id)
    if (!at) return
    const overStatus = Object.keys(STATUS_CONFIG).includes(over.id as string)
      ? (over.id as TicketStatus)
      : tickets.find(t => t.id === over.id)?.status
    if (overStatus && at.status !== overStatus)
      onTicketsChange(tickets.map(t => t.id === active.id ? { ...t, status: overStatus } : t))
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveTicket(null)
    if (!over || active.id === over.id) return
    const at = tickets.find(t => t.id === active.id)
    if (!at) return
    const targetStatus = Object.keys(STATUS_CONFIG).includes(over.id as string)
      ? (over.id as TicketStatus)
      : tickets.find(t => t.id === over.id)?.status ?? at.status
    const col = tickets.filter(t => t.status === targetStatus)
    const oi = col.findIndex(t => t.id === active.id)
    const ni = col.findIndex(t => t.id === over.id)
    const reordered = oi !== -1 && ni !== -1 ? arrayMove(col, oi, ni) : col
    const updated = tickets.map(t => {
      const idx = reordered.findIndex(r => r.id === t.id)
      return idx !== -1 ? { ...reordered[idx], status: targetStatus, order: idx } : t
    })
    onTicketsChange(updated)
    await fetch(`/api/tickets/${at.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus, order: reordered.findIndex(r => r.id === at.id) }),
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>

      {/*
        Responsive grid: 2 cols on mobile → 3 on md → 5 on xl
        Each column is fluid — fills available space evenly
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 h-full overflow-y-auto p-4 items-start">
        {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map(s => (
          <KanbanColumn key={s} status={s} tickets={getByStatus(s)} onCardClick={onCardClick} onAddClick={() => onAddClick(s)} />
        ))}
      </div>

      <DragOverlay>
        {activeTicket && (
          <div className="ticket-card rotate-1 shadow-2xl w-48"
            style={{ borderLeft: `3px solid ${activeTicket.labelColor}` }}>
            <p className="text-xs font-medium text-primary">{activeTicket.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
