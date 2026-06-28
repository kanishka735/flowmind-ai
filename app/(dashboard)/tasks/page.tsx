'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTasks } from '@/lib/hooks/useTasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Task } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { sortTasksByUrgency } from '@/lib/utils/priority'
import Link from 'next/link'

type FilterTab = 'all' | 'pending' | 'overdue' | 'completed'
type SortBy = 'urgency' | 'deadline' | 'priority' | 'created'

const FILTER_TABS: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: 'all',       label: 'All Tasks', icon: ListTodo },
  { id: 'pending',   label: 'Pending',   icon: Clock },
  { id: 'overdue',   label: 'Overdue',   icon: AlertTriangle },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
]

export default function TasksPage() {
  const { user } = useAuth()
  const { tasks, loading, createTask, updateTask, deleteTask, completeTask } = useTasks(user?.uid)

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [sortBy, setSortBy] = useState<SortBy>('urgency')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Compute overdue tasks by checking deadline
  const tasksWithOverdue = useMemo(() => {
    const now = new Date()
    return tasks.map((t) => ({
      ...t,
      status:
        t.status !== 'completed' && new Date(t.deadline) < now
          ? ('overdue' as const)
          : t.status,
    }))
  }, [tasks])

  // Filter
  const filtered = useMemo(() => {
    let list = tasksWithOverdue

    if (activeFilter !== 'all') {
      list = list.filter((t) => t.status === activeFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    return list
  }, [tasksWithOverdue, activeFilter, searchQuery])

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'urgency':
        return sortTasksByUrgency(list)
      case 'deadline':
        return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      case 'priority': {
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        return list.sort((a, b) => order[a.priority] - order[b.priority])
      }
      case 'created':
        return list
      default:
        return list
    }
  }, [filtered, sortBy])

  // Tab counts
  const counts = useMemo(() => ({
    all: tasksWithOverdue.length,
    pending: tasksWithOverdue.filter((t) => t.status === 'pending').length,
    overdue: tasksWithOverdue.filter((t) => t.status === 'overdue').length,
    completed: tasksWithOverdue.filter((t) => t.status === 'completed').length,
  }), [tasksWithOverdue])

  async function handleCreateTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    await createTask(data)
  }

  async function handleUpdateTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!editingTask) return
    await updateTask(editingTask.id, data)
    setEditingTask(null)
  }

  function handleEditTask(task: Task) {
    setEditingTask(task)
    setShowForm(false)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingTask(null)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#F0F0FF]">My Tasks</h1>
          <p className="text-[#8B8BA7] text-sm mt-1">
            {counts.all} total · {counts.pending} pending · {counts.overdue > 0 && (
              <span className="text-red-400">{counts.overdue} overdue · </span>
            )}
            {counts.completed} done
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ai-center"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Analyze
          </Link>
          <button
            id="btn-add-task"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 btn-primary py-2.5 px-5"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Search + Sort Bar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A6A]" />
          <input
            id="task-search"
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark pl-9"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1C1C27] border border-[#2A2A3A] text-[#8B8BA7] hover:text-[#F0F0FF] hover:border-white/20 transition-colors text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline capitalize">{sortBy}</span>
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 bg-[#1C1C27] border border-[#2A2A3A] rounded-xl p-1.5 min-w-[140px] z-20 shadow-2xl"
              >
                {(['urgency', 'deadline', 'priority', 'created'] as SortBy[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSortBy(option); setShowSortMenu(false) }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors',
                      sortBy === option
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-[#8B8BA7] hover:bg-white/5 hover:text-[#F0F0FF]'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-6 bg-[#13131A] border border-[#2A2A3A] rounded-xl p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`filter-${tab.id}`}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeFilter === tab.id
                ? 'bg-[#6C63FF] text-white shadow-sm'
                : 'text-[#8B8BA7] hover:text-[#F0F0FF] hover:bg-white/5'
            )}
          >
            <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            {counts[tab.id] > 0 && (
              <span
                className={cn(
                  'text-xs rounded-full px-1.5 py-0.5 font-semibold',
                  activeFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.id === 'overdue'
                    ? 'bg-red-400/20 text-red-400'
                    : 'bg-white/10 text-[#8B8BA7]'
                )}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            {activeFilter === 'completed' ? (
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            ) : activeFilter === 'overdue' ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : (
              <ListTodo className="w-8 h-8 text-purple-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-[#F0F0FF] mb-2">
            {activeFilter === 'completed'
              ? 'No completed tasks yet'
              : activeFilter === 'overdue'
              ? 'No overdue tasks 🎉'
              : searchQuery
              ? 'No tasks match your search'
              : 'No tasks yet'}
          </h3>
          <p className="text-[#8B8BA7] text-sm mb-6">
            {activeFilter === 'overdue'
              ? 'Great job staying on top of your deadlines!'
              : activeFilter === 'completed'
              ? 'Complete some tasks to see them here.'
              : searchQuery
              ? 'Try a different search term.'
              : 'Add your first task and let AI help you prioritize it.'}
          </p>
          {!searchQuery && activeFilter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Task
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {sorted.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onComplete={completeTask}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Floating Add button on mobile */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-[#6C63FF] shadow-glow-purple flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Task Form Modal */}
      {showForm && user && (
        <TaskForm
          mode="create"
          userId={user.uid}
          onSubmit={handleCreateTask}
          onClose={handleCloseForm}
        />
      )}
      {editingTask && user && (
        <TaskForm
          mode="edit"
          userId={user.uid}
          initialData={editingTask}
          onSubmit={handleUpdateTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
