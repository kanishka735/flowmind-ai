'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTasks } from '@/lib/hooks/useTasks'
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Sparkles, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDeadline, getDeadlineUrgency, formatDuration } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { Task } from '@/lib/types'
import { isToday, isPast } from 'date-fns'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function ProductivityRing({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#2A2A3A" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00D4AA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-black gradient-text">{score}</span>
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const urgency = getDeadlineUrgency(task.deadline)
  const urgencyColors = {
    overdue: 'text-red-400',
    critical: 'text-orange-400',
    warning: 'text-yellow-400',
    normal: 'text-[#8B8BA7]',
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#2A2A3A] last:border-0 group">
      <div className={cn(
        'w-2 h-2 rounded-full flex-shrink-0',
        task.priority === 'critical' && 'bg-red-400',
        task.priority === 'high' && 'bg-orange-400',
        task.priority === 'medium' && 'bg-yellow-400',
        task.priority === 'low' && 'bg-green-400',
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F0F0FF] truncate">{task.title}</p>
        <p className="text-xs text-[#8B8BA7]">{task.category} · {formatDuration(task.estimatedDuration)}</p>
      </div>
      <span className={cn('text-xs font-medium flex-shrink-0', urgencyColors[urgency])}>
        {formatDeadline(task.deadline)}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, loading } = useTasks(user?.uid)

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const pendingTasks = tasks.filter(t => t.status !== 'completed')
  const overdueTasks = tasks.filter(t => isPast(new Date(t.deadline)) && t.status !== 'completed')
  const todayTasks = tasks.filter(t => isToday(new Date(t.deadline)) && t.status !== 'completed')

  const productivityScore = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0

  const totalHoursNeeded = pendingTasks.reduce((sum, t) => sum + t.estimatedDuration, 0) / 60

  const recentTasks = pendingTasks
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  const stats = [
    {
      label: 'Tasks Today',
      value: todayTasks.length,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      sub: `${todayTasks.length} due today`,
    },
    {
      label: 'Overdue',
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      sub: overdueTasks.length > 0 ? 'Needs attention' : 'All on track',
    },
    {
      label: 'Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bg: 'bg-teal-400/10',
      sub: `of ${tasks.length} total`,
    },
    {
      label: 'Hours Needed',
      value: `${totalHoursNeeded.toFixed(1)}h`,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      sub: 'remaining work',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2 rounded-xl', stat.bg)}>
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                </div>
              </div>
              <div className="text-3xl font-black text-[#F0F0FF] mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-[#8B8BA7]">{stat.label}</div>
            </div>
            <div className="text-xs text-[#4A4A6A] mt-2 pt-2 border-t border-white/5">{stat.sub}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's focus */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">Upcoming Deadlines</h2>
            <Link href="/tasks" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-3" />
              <p className="text-sm text-[#8B8BA7]">No pending tasks. Add one to get started.</p>
              <Link href="/tasks" className="inline-flex items-center gap-2 mt-4 btn-primary text-sm px-4 py-2">
                <Plus className="w-4 h-4" /> Add Task
              </Link>
            </div>
          ) : (
            <div>
              {recentTasks.map(task => <TaskRow key={task.id} task={task} />)}
            </div>
          )}
        </motion.div>

        {/* Productivity score + AI prompt */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 h-full justify-between">
          <div className="card flex-1 flex flex-col justify-center">
            <h2 className="text-sm font-bold mb-4 text-[#8B8BA7] uppercase tracking-wider">Productivity Score</h2>
            <div className="flex items-center gap-4">
              <ProductivityRing score={productivityScore} />
              <div>
                <p className="text-2xl font-black text-[#F0F0FF]">{productivityScore}%</p>
                <p className="text-xs text-[#8B8BA7]">
                  {productivityScore >= 70 ? 'Great work!' : productivityScore >= 40 ? 'Keep going!' : 'Let AI help you'}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/ai-center"
            id="dashboard-ai-btn"
            className="card group cursor-pointer hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs font-semibold text-teal-400">Gemini AI Ready</span>
              </div>
              <h3 className="text-sm font-bold mb-1">Get AI Analysis</h3>
              <p className="text-xs text-[#8B8BA7] mb-3">
                Let AI analyze your workload and generate a smart action plan.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-400 group-hover:gap-3 transition-all mt-2">
              <Sparkles className="w-3.5 h-3.5" />
              Open AI Command Center
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
