import { format, isPast, isToday, isTomorrow, differenceInDays, differenceInHours } from 'date-fns'

export function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isPast(date)) return `${Math.abs(differenceInDays(date, new Date()))}d overdue`
  return format(date, 'MMM d')
}

export function getDeadlineUrgency(dateStr: string): 'overdue' | 'critical' | 'warning' | 'normal' {
  const date = new Date(dateStr)
  if (isPast(date)) return 'overdue'
  const hoursLeft = differenceInHours(date, new Date())
  if (hoursLeft < 24) return 'critical'
  if (hoursLeft < 72) return 'warning'
  return 'normal'
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
