export type TicketStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface TimeBlock {
  id: string
  ticketId: string
  date: string        // ISO date string 'YYYY-MM-DD'
  startHour: number   // 0-23
  duration: number    // hours (0.5, 1, 1.5, 2, ...)
}

export interface Ticket {
  id: string
  title: string
  description?: string | null
  status: TicketStatus
  priority: Priority
  label: string
  labelColor: string
  dueDate?: string | null
  assignee?: string | null
  assigneeColor?: string | null
  order: number
  projectId?: string | null
  timeBlocks?: TimeBlock[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string | null
  color: string
  tickets: Ticket[]
}

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; accent: string; darkBg: string; darkAccent: string }> = {
  BACKLOG:     { label: 'Backlog',     color: '#7a7890', bg: '#F1EFE8', accent: '#888780', darkBg: 'rgba(136,135,128,0.15)', darkAccent: '#888780' },
  IN_PROGRESS: { label: 'In Progress', color: '#a59dff', bg: '#EEEDFE', accent: '#7F77DD', darkBg: 'rgba(165,157,255,0.18)', darkAccent: '#a59dff' },
  REVIEW:      { label: 'Review',      color: '#f5c26b', bg: '#FAEEDA', accent: '#EF9F27', darkBg: 'rgba(239,159,39,0.18)', darkAccent: '#f5c26b' },
  DONE:        { label: 'Done',        color: '#5ecba1', bg: '#E1F5EE', accent: '#1D9E75', darkBg: 'rgba(94,203,161,0.15)', darkAccent: '#5ecba1' },
  BLOCKED:     { label: 'Blocked',     color: '#f0889f', bg: '#FBEAF0', accent: '#D4537E', darkBg: 'rgba(212,83,126,0.18)', darkAccent: '#f0889f' },
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW:      '#888780',
  MEDIUM:   '#f5c26b',
  HIGH:     '#f0889f',
  CRITICAL: '#D4537E',
}

export const LABEL_COLORS = [
  { name: 'Purple', value: '#a59dff' },
  { name: 'Pink',   value: '#f0889f' },
  { name: 'Amber',  value: '#f5c26b' },
  { name: 'Green',  value: '#5ecba1' },
  { name: 'Blue',   value: '#7ab8f5' },
]

export const WEEK_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

export interface TeamMember {
  id: string
  name: string
  email: string
  avatarColor: string
  role: string
  joinedAt: string
}
