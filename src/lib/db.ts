import { Pool } from 'pg'
import { Ticket, Project, TimeBlock } from '@/types'

const pool = new Pool({ connectionString: process.env.POSTGRES_URL })

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

export function rowToTimeBlock(row: Record<string, unknown>): TimeBlock {
  return {
    id:        row.id as string,
    ticketId:  row.ticket_id as string,
    date:      (row.date as Date).toISOString().slice(0, 10),
    startHour: Number(row.start_hour),
    duration:  Number(row.duration),
  }
}

export function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id:            row.id as string,
    title:         row.title as string,
    description:   row.description as string | null,
    status:        row.status as Ticket['status'],
    priority:      row.priority as Ticket['priority'],
    label:         row.label as string,
    labelColor:    row.label_color as string,
    dueDate:       row.due_date ? (row.due_date as Date).toISOString() : null,
    assignee:      row.assignee as string | null,
    assigneeColor: row.assignee_color as string | null,
    order:         row.sort_order as number,
    projectId:     row.project_id as string | null,
    createdAt:     (row.created_at as Date).toISOString(),
    updatedAt:     (row.updated_at as Date).toISOString(),
  }
}

export function rowToProject(row: Record<string, unknown>): Project {
  return {
    id:          row.id as string,
    name:        row.name as string,
    description: row.description as string | null,
    color:       row.color as string,
    tickets:     [],
  }
}

export function newId(): string {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}
