import { Task, Priority } from '@/lib/types'
import { differenceInHours } from 'date-fns'

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
}

export const PRIORITY_DOT: Record<Priority, string> = {
  critical: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
}

export function computeUrgencyScore(task: Task): number {
  const hoursLeft = differenceInHours(new Date(task.deadline), new Date())
  const deadlineScore = hoursLeft < 0 ? 100 : Math.max(0, 100 - hoursLeft)
  const priorityScore = PRIORITY_ORDER[task.priority] * 25
  const difficultyScore = task.difficulty * 5
  return deadlineScore * 0.5 + priorityScore * 0.3 + difficultyScore * 0.2
}

export function sortTasksByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => computeUrgencyScore(b) - computeUrgencyScore(a))
}

export function getTotalEstimatedHours(tasks: Task[]): number {
  const pendingTasks = tasks.filter(t => t.status !== 'completed')
  const totalMinutes = pendingTasks.reduce((sum, t) => sum + t.estimatedDuration, 0)
  return Math.round((totalMinutes / 60) * 10) / 10
}
