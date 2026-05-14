'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Ticket } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props { ticket: Ticket; onClick: (t: Ticket) => void }

export default function TicketCard({ ticket, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onClick(ticket)}
      className="ticket-card"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        borderLeft: `3px solid ${ticket.labelColor}`,
      }}
    >
      <span className="label-pill" style={{ background: `${ticket.labelColor}22`, color: ticket.labelColor }}>
        {ticket.label}
      </span>

      <p className="text-xs font-medium leading-relaxed mb-3 text-primary">{ticket.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ticket.assignee && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
              style={{ background: ticket.assigneeColor ?? '#a59dff' }}>
              {ticket.assignee}
            </div>
          )}
          {ticket.dueDate && (
            <span className="text-[10px] text-muted">{formatDate(ticket.dueDate)}</span>
          )}
        </div>
        {ticket.timeBlocks && ticket.timeBlocks.length > 0 && (
          <span className="text-[9px] text-accent opacity-60">
            {ticket.timeBlocks.length}b
          </span>
        )}
      </div>
    </div>
  )
}
