'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  CalendarDays,
} from 'lucide-react'
import { Task } from '@/lib/types'
import { formatDeadline, getDeadlineUrgency, formatDuration } from '@/lib/utils/date'
import { PRIORITY_COLORS, PRIORITY_DOT } from '@/lib/utils/priority'
import { cn } from '@/lib/utils/cn'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onComplete: (taskId: string) => void
  index?: number
}

const CATEGORY_EMOJI: Record<string, string> = {
  work: '💼',
  study: '📚',
  personal: '🏠',
  health: '💪',
  finance: '💰',
  other: '📌',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-[#8B8BA7]',
  'in-progress': 'text-blue-400',
  completed: 'text-teal-400',
  overdue: 'text-red-400',
}

const DEADLINE_URGENCY_STYLES = {
  overdue: 'text-red-400',
  critical: 'text-orange-400',
  warning: 'text-yellow-400',
  normal: 'text-[#8B8BA7]',
}

export function TaskCard({ task, onEdit, onDelete, onComplete, index = 0 }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const deadlineUrgency = getDeadlineUrgency(task.deadline)
  const isCompleted = task.status === 'completed'

  async function handleDelete() {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
      return
    }
    setIsDeleting(true)
    await onDelete(task.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        'group relative bg-[#13131A] border rounded-2xl p-5 transition-all duration-300',
        isCompleted
          ? 'border-[#2A2A3A] opacity-60'
          : 'border-[#2A2A3A] hover:border-purple-500/30 hover:shadow-[0_4px_24px_rgba(108,99,255,0.1)]'
      )}
    >
      {/* Priority accent bar */}
      <div
        className={cn(
          'absolute left-0 top-4 bottom-4 w-0.5 rounded-full ml-0',
          PRIORITY_DOT[task.priority]
        )}
        style={{ left: 0, borderRadius: '0 2px 2px 0' }}
      />

      <div className="pl-2">
        {/* Top row: checkbox + title + actions */}
        <div className="flex items-start gap-3">
          {/* Complete toggle */}
          <button
            id={`task-complete-${task.id}`}
            onClick={() => !isCompleted && onComplete(task.id)}
            className={cn(
              'flex-shrink-0 mt-0.5 transition-colors duration-200',
              isCompleted
                ? 'text-teal-400 cursor-default'
                : 'text-[#4A4A6A] hover:text-teal-400'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  'font-semibold text-[#F0F0FF] text-sm leading-snug truncate',
                  isCompleted && 'line-through text-[#4A4A6A]'
                )}
              >
                {task.title}
              </h3>
              {/* Priority badge */}
              <span
                className={cn(
                  'flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium',
                  PRIORITY_COLORS[task.priority]
                )}
              >
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className="text-xs text-[#8B8BA7] mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Action buttons — always visible on mobile (touch), hover-reveal on desktop */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <button
              id={`task-edit-${task.id}`}
              onClick={() => onEdit(task)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 flex items-center justify-center transition-colors text-[#8B8BA7]"
              title="Edit task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`task-delete-${task.id}`}
              onClick={handleDelete}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-[#8B8BA7]',
                showConfirm
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-white/5 hover:bg-red-500/20 hover:text-red-400'
              )}
              title={showConfirm ? 'Click again to confirm delete' : 'Delete task'}
              disabled={isDeleting}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom row: meta info */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {/* Category */}
          <span className="flex items-center gap-1 text-xs text-[#8B8BA7]">
            <span>{CATEGORY_EMOJI[task.category]}</span>
            <span className="capitalize">{task.category}</span>
          </span>

          {/* Deadline */}
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              DEADLINE_URGENCY_STYLES[deadlineUrgency]
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDeadline(task.deadline)}
          </span>

          {/* Duration */}
          <span className="flex items-center gap-1 text-xs text-[#8B8BA7]">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(task.estimatedDuration)}
          </span>

          {/* Difficulty dots */}
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((d) => (
              <span
                key={d}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  d <= task.difficulty ? 'bg-purple-400' : 'bg-[#2A2A3A]'
                )}
              />
            ))}
          </span>

          {/* Status */}
          {task.status !== 'pending' && (
            <span className={cn('text-xs font-medium capitalize', STATUS_STYLES[task.status])}>
              {task.status === 'in-progress' ? 'In Progress' : task.status}
            </span>
          )}
        </div>

        {/* Progress bar (if in-progress) */}
        {task.status === 'in-progress' && task.progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[#8B8BA7] mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="h-1 bg-[#2A2A3A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirm delete message */}
        {showConfirm && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 mt-2"
          >
            Click delete again to confirm removal.
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
