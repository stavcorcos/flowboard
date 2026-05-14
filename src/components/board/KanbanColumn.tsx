'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Ticket, TicketStatus, STATUS_CONFIG } from '@/types'
import TicketCard from './TicketCard'

interface Props {
  status: TicketStatus
  tickets: Ticket[]
  onCardClick: (t: Ticket) => void
  onAddClick: () => void
}

export default function KanbanColumn({ status, tickets, onCardClick, onAddClick }: Props) {
  const cfg = STATUS_CONFIG[status]
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div className="flex flex-col gap-2 min-w-0 w-full">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.darkAccent }}>
          {cfg.label}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: cfg.darkBg, color: cfg.darkAccent }}>
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 flex-1 min-h-[40px]">
          {tickets.map(t => <TicketCard key={t.id} ticket={t} onClick={onCardClick} />)}
        </div>
      </SortableContext>

      <button onClick={onAddClick} className="add-ticket-btn">
        + Add ticket
      </button>
    </div>
  )
}
