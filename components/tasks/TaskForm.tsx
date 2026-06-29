'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Calendar, Clock, Tag, Flame } from 'lucide-react'
import { Task, Priority, Category, Difficulty } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  description: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  deadline: z.string().min(1, 'Deadline is required'),
  estimatedDuration: z.coerce
    .number()
    .min(15, 'Minimum 15 minutes')
    .max(1440, 'Maximum 24 hours (1440 min)'),
  category: z.enum(['work', 'study', 'personal', 'health', 'finance', 'other']),
  difficulty: z.coerce.number().min(1).max(5),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onClose: () => void
  initialData?: Partial<Task>
  userId: string
  mode: 'create' | 'edit'
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'critical', label: '🔴 Critical', color: 'border-red-400/50 bg-red-400/10 text-red-400' },
  { value: 'high',     label: '🟠 High',     color: 'border-orange-400/50 bg-orange-400/10 text-orange-400' },
  { value: 'medium',   label: '🟡 Medium',   color: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400' },
  { value: 'low',      label: '🟢 Low',      color: 'border-green-400/50 bg-green-400/10 text-green-400' },
]

const CATEGORY_OPTIONS: { value: Category; label: string; emoji: string }[] = [
  { value: 'work',     label: 'Work',     emoji: '💼' },
  { value: 'study',    label: 'Study',    emoji: '📚' },
  { value: 'personal', label: 'Personal', emoji: '🏠' },
  { value: 'health',   label: 'Health',   emoji: '💪' },
  { value: 'finance',  label: 'Finance',  emoji: '💰' },
  { value: 'other',    label: 'Other',    emoji: '📌' },
]

const DURATION_PRESETS = [
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
  { label: '4h', value: 240 },
]

export function TaskForm({ onSubmit, onClose, initialData, userId, mode }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      deadline: initialData?.deadline || '',
      estimatedDuration: initialData?.estimatedDuration || 60,
      category: initialData?.category || 'work',
      difficulty: initialData?.difficulty || 3,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedPriority = watch('priority')
  const watchedCategory = watch('category')
  const watchedDifficulty = watch('difficulty')
  const watchedDuration = watch('estimatedDuration')

  async function handleFormSubmit(data: TaskFormData) {
    setIsSubmitting(true)
    try {
      await onSubmit({
        userId,
        title: data.title,
        description: data.description || '',
        priority: data.priority,
        status: initialData?.status || 'pending',
        deadline: data.deadline,
        estimatedDuration: data.estimatedDuration,
        category: data.category,
        difficulty: data.difficulty as Difficulty,
        progress: initialData?.progress || 0,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date as min for deadline picker
  const today = new Date().toISOString().split('T')[0]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#13131A] border border-[#2A2A3A] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Purple top accent */}
          <div className="h-0.5 bg-gradient-to-r from-purple-500 to-teal-500" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2A2A3A]">
            <div>
              <h2 className="text-lg font-bold text-[#F0F0FF]">
                {mode === 'create' ? 'Add New Task' : 'Edit Task'}
              </h2>
              <p className="text-xs text-[#8B8BA7] mt-0.5">
                {mode === 'create' ? 'AI will analyze and prioritize this task' : 'Update task details'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#8B8BA7]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                {...register('title')}
                id="task-title"
                placeholder="e.g., Finish project report"
                className="input-dark h-12"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                Description <span className="text-[#4A4A6A] font-normal">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                id="task-description"
                rows={2}
                placeholder="Additional details..."
                className="input-dark resize-none py-3"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                <Flame className="w-4 h-4 inline mr-1 text-orange-400" />
                Priority <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('priority', opt.value)}
                    className={cn(
                      'h-10 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-center text-center',
                      watchedPriority === opt.value
                        ? opt.color
                        : 'border-[#2A2A3A] bg-[#1C1C27] text-[#8B8BA7] hover:border-white/20'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline + Duration row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1 text-purple-400" />
                  Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('deadline')}
                  id="task-deadline"
                  type="date"
                  min={today}
                  className="input-dark h-12 [color-scheme:dark]"
                />
                {errors.deadline && (
                  <p className="text-red-400 text-xs mt-1">{errors.deadline.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                  <Clock className="w-4 h-4 inline mr-1 text-teal-400" />
                  Est. Time (min)
                </label>
                <input
                  {...register('estimatedDuration')}
                  id="task-duration"
                  type="number"
                  min={15}
                  max={1440}
                  step={15}
                  className="input-dark h-12"
                />
                {/* Quick presets */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue('estimatedDuration', p.value)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-lg transition-colors border',
                        watchedDuration === p.value
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-white/5 border-transparent text-[#8B8BA7] hover:bg-white/10'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                <Tag className="w-4 h-4 inline mr-1 text-blue-400" />
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('category', opt.value)}
                    className={cn(
                      'h-10 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-center text-center',
                      watchedCategory === opt.value
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                        : 'border-[#2A2A3A] bg-[#1C1C27] text-[#8B8BA7] hover:border-white/20'
                    )}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-[#F0F0FF] mb-2">
                Difficulty
                <span className="ml-2 text-[#8B8BA7] font-normal text-xs">
                  ({['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'][watchedDifficulty]})
                </span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setValue('difficulty', level as Difficulty)}
                    className={cn(
                      'flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center',
                      watchedDifficulty >= level
                        ? 'bg-gradient-to-b from-purple-500 to-purple-600 text-white'
                        : 'bg-[#1C1C27] text-[#4A4A6A] border border-[#2A2A3A] hover:bg-[#2A2A3A]'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-[#2A2A3A]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 btn-secondary flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                id="task-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  mode === 'create' ? '+ Add Task' : 'Save Changes'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
