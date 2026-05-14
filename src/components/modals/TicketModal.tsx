'use client'
import { useState, useEffect } from 'react'
import { Ticket, TicketStatus, Priority, LABEL_COLORS, STATUS_CONFIG, PRIORITY_COLORS } from '@/types'

interface Props {
  ticket?: Ticket | null
  defaultStatus?: TicketStatus
  onClose: () => void
  onSave: (t: Ticket) => void
  onDelete?: (id: string) => void
}

const ASSIGNEES = [
  { initials: 'JL', color: '#f0889f', name: 'Jamie' },
  { initials: 'MR', color: '#5ecba1', name: 'Maya'  },
  { initials: 'TK', color: '#f5c26b', name: 'Theo'  },
]

export default function TicketModal({ ticket, defaultStatus, onClose, onSave, onDelete }: Props) {
  const isEdit = !!ticket
  const [title,        setTitle]        = useState(ticket?.title ?? '')
  const [description,  setDescription]  = useState(ticket?.description ?? '')
  const [status,       setStatus]       = useState<TicketStatus>(ticket?.status ?? defaultStatus ?? 'BACKLOG')
  const [priority,     setPriority]     = useState<Priority>(ticket?.priority ?? 'MEDIUM')
  const [label,        setLabel]        = useState(ticket?.label ?? 'Task')
  const [labelColor,   setLabelColor]   = useState(ticket?.labelColor ?? '#a59dff')
  const [dueDate,      setDueDate]      = useState(ticket?.dueDate ? ticket.dueDate.slice(0, 10) : '')
  const [assignee,     setAssignee]     = useState(ticket?.assignee ?? '')
  const [assigneeColor,setAssigneeColor]= useState(ticket?.assigneeColor ?? '')
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const payload = { title, description, status, priority, label, labelColor, dueDate: dueDate || null, assignee, assigneeColor }
    const res = isEdit
      ? await fetch(`/api/tickets/${ticket!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/tickets',                { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const saved = await res.json()
    onSave({ ...saved, timeBlocks: ticket?.timeBlocks ?? [] })
    setSaving(false)
  }

  async function handleDelete() {
    if (!ticket || !onDelete || !confirm('Delete this ticket?')) return
    await fetch(`/api/tickets/${ticket.id}`, { method: 'DELETE' })
    onDelete(ticket.id)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-base font-bold text-primary">
            {isEdit ? 'Edit Ticket' : 'New Ticket'}
          </h2>
          <button onClick={onClose} className="btn-ghost w-7 h-7 flex items-center justify-center text-lg">×</button>
        </div>

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What needs to get done?" className="input-dark" />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Add context…" rows={2} className="input-dark resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="form-label">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as TicketStatus)} className="input-dark">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="input-dark">
              {Object.keys(PRIORITY_COLORS).map(p => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="form-label">Label</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              placeholder="Design, Dev, Bug…" className="input-dark" />
          </div>
          <div>
            <label className="form-label">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-dark" style={{ colorScheme: 'dark' }} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Assignee</label>
          <div className="flex flex-wrap gap-2">
            {ASSIGNEES.map(a => (
              <button key={a.initials}
                onClick={() => { setAssignee(a.initials); setAssigneeColor(a.color) }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={assignee === a.initials
                  ? { borderColor: a.color, background: `${a.color}22`, color: a.color }
                  : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: a.color }}>{a.initials}</div>
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="form-label">Label Color</label>
          <div className="flex gap-2">
            {LABEL_COLORS.map(c => (
              <button key={c.value}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{ background: c.value, borderColor: labelColor === c.value ? 'var(--text-primary)' : 'transparent' }}
                onClick={() => setLabelColor(c.value)} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {isEdit && onDelete && (
            <button onClick={handleDelete} className="mr-auto text-xs text-[#f0889f] bg-transparent border-none cursor-pointer hover:underline">
              Delete
            </button>
          )}
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim() || saving} className="btn-accent disabled:opacity-40">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}
