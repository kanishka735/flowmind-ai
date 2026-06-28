'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  Flame,
  Award,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTasks } from '@/lib/hooks/useTasks'
import { PRIORITY_COLORS } from '@/lib/utils/priority'
import { formatDuration } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

const CATEGORY_EMOJI: Record<string, string> = {
  work: '💼', study: '📚', personal: '🏠', health: '💪', finance: '💰', other: '📌',
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { tasks, loading } = useTasks(user?.uid)

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const pending = tasks.filter((t) => t.status === 'pending').length
    const now = new Date()
    const overdue = tasks.filter(
      (t) => t.status !== 'completed' && new Date(t.deadline) < now
    ).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const totalEstimated = tasks
      .filter((t) => t.status !== 'completed')
      .reduce((sum, t) => sum + t.estimatedDuration, 0)

    // Category breakdown
    const byCategory = tasks.reduce<Record<string, { total: number; done: number }>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { total: 0, done: 0 }
      acc[t.category].total++
      if (t.status === 'completed') acc[t.category].done++
      return acc
    }, {})

    // Priority breakdown
    const byPriority = tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1
      return acc
    }, {})

    // Avg difficulty of pending tasks
    const pendingTasks = tasks.filter((t) => t.status !== 'completed')
    const avgDifficulty =
      pendingTasks.length > 0
        ? (pendingTasks.reduce((sum, t) => sum + t.difficulty, 0) / pendingTasks.length).toFixed(1)
        : '0'

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      totalEstimated,
      byCategory,
      byPriority,
      avgDifficulty,
    }
  }, [tasks])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-[#F0F0FF]">Analytics</h1>
        </div>
        <p className="text-[#8B8BA7] text-sm">Your productivity at a glance</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Tasks',
            value: stats.total,
            icon: Target,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
          {
            label: 'Completed',
            value: stats.completed,
            icon: CheckCircle2,
            color: 'text-teal-400',
            bg: 'bg-teal-400/10',
          },
          {
            label: 'Overdue',
            value: stats.overdue,
            icon: AlertTriangle,
            color: stats.overdue > 0 ? 'text-red-400' : 'text-[#8B8BA7]',
            bg: stats.overdue > 0 ? 'bg-red-400/10' : 'bg-white/5',
          },
          {
            label: 'Hours Needed',
            value: formatDuration(stats.totalEstimated),
            icon: Clock,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <div className={cn('text-2xl font-black mb-0.5', s.color)}>{s.value}</div>
            <div className="text-xs text-[#8B8BA7]">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Completion Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-[#F0F0FF]">Completion Rate</span>
          </div>
          <span className="text-2xl font-black gradient-text">{stats.completionRate}%</span>
        </div>
        <div className="h-3 bg-[#2A2A3A] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-[#8B8BA7] mt-2">
          <span>{stats.completed} completed</span>
          <span>{stats.total} total</span>
        </div>

        {/* Performance label */}
        <div className="mt-3 text-center">
          <span className={cn(
            'text-xs font-medium px-3 py-1 rounded-full',
            stats.completionRate >= 80 ? 'bg-teal-400/10 text-teal-400' :
            stats.completionRate >= 50 ? 'bg-yellow-400/10 text-yellow-400' :
            'bg-orange-400/10 text-orange-400'
          )}>
            {stats.completionRate >= 80 ? '🏆 Excellent Progress!' :
             stats.completionRate >= 50 ? '📈 Good Progress' :
             stats.total === 0 ? '👋 Add tasks to get started' :
             '💪 Keep pushing!'}
          </span>
        </div>
      </motion.div>

      {/* Two column: Category + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Category */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5"
        >
          <h3 className="font-bold text-[#F0F0FF] mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-400" />
            By Category
          </h3>
          {Object.keys(stats.byCategory).length === 0 ? (
            <p className="text-[#4A4A6A] text-sm text-center py-6">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.byCategory)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([cat, data]) => {
                  const pct = Math.round((data.done / data.total) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[#F0F0FF] flex items-center gap-1.5">
                          {CATEGORY_EMOJI[cat]}
                          <span className="capitalize">{cat}</span>
                        </span>
                        <span className="text-[#8B8BA7] text-xs">{data.done}/{data.total}</span>
                      </div>
                      <div className="h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </motion.div>

        {/* By Priority */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5"
        >
          <h3 className="font-bold text-[#F0F0FF] mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            By Priority
          </h3>
          {Object.keys(stats.byPriority).length === 0 ? (
            <p className="text-[#4A4A6A] text-sm text-center py-6">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {(['critical', 'high', 'medium', 'low'] as const)
                .filter((p) => stats.byPriority[p])
                .map((priority) => {
                  const count = stats.byPriority[priority] || 0
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  const barColors: Record<string, string> = {
                    critical: 'bg-red-400',
                    high: 'bg-orange-400',
                    medium: 'bg-yellow-400',
                    low: 'bg-green-400',
                  }
                  return (
                    <div key={priority}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full border font-medium capitalize',
                          PRIORITY_COLORS[priority]
                        )}>
                          {priority}
                        </span>
                        <span className="text-[#8B8BA7] text-xs">{count} tasks ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
                          className={cn('h-full rounded-full', barColors[priority])}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Avg difficulty */}
          <div className="mt-4 pt-4 border-t border-[#2A2A3A]">
            <div className="flex justify-between text-sm">
              <span className="text-[#8B8BA7]">Avg. Difficulty</span>
              <div className="flex items-center gap-1">
                <span className="text-[#F0F0FF] font-bold">{stats.avgDifficulty}</span>
                <span className="text-[#4A4A6A] text-xs">/ 5</span>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <div
                  key={d}
                  className={cn(
                    'flex-1 h-1.5 rounded-full',
                    d <= parseFloat(stats.avgDifficulty) ? 'bg-purple-400' : 'bg-[#2A2A3A]'
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
