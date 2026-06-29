'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTasks } from '@/lib/hooks/useTasks'
import { AIAnalysis, AnalyzeRequest } from '@/lib/types'
import { getTimeOfDay } from '@/lib/utils/date'
import { getTotalEstimatedHours } from '@/lib/utils/priority'
import { cn } from '@/lib/utils/cn'

const HOUR_OPTIONS = [2, 4, 6, 8, 10, 12]

export default function AICenterPage() {
  const { user } = useAuth()
  const { tasks, loading: tasksLoading } = useTasks(user?.uid)

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableHours, setAvailableHours] = useState(6)
  const [userGoal, setUserGoal] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('briefing')

  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const totalHoursNeeded = getTotalEstimatedHours(pendingTasks)

  async function runAnalysis() {
    if (pendingTasks.length === 0) {
      setError('Add some tasks first, then I can analyze and prioritize them for you!')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const payload: AnalyzeRequest = {
        tasks: pendingTasks,
        availableHours,
        timeOfDay: getTimeOfDay(),
        userGoal: userGoal.trim() || undefined,
      }

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data as AIAnalysis)
      setExpandedSection('briefing')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const priorityColors: Record<string, string> = {
    '1': 'text-red-400 bg-red-400/10 border-red-400/20',
    '2': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    '3': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    '4': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    '5': 'text-[#8B8BA7] bg-white/5 border-white/10',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-[#F0F0FF]">AI Command Center</h1>
              <p className="text-[#8B8BA7] text-xs">Powered by Google Gemini 2.0 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Gemini Active</span>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
        <h2 className="text-base font-bold text-[#F0F0FF] mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Configure Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available hours */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#F0F0FF]">
              How many hours do you have today?
            </label>
            <div className="flex gap-2 flex-wrap">
              {HOUR_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setAvailableHours(h)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150',
                    availableHours === h
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-[#1C1C27] border-[#2A2A3A] text-[#8B8BA7] hover:border-white/20'
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Task summary */}
          <div className="flex flex-col justify-end">
            <div className="bg-[#1C1C27] rounded-xl p-4 border border-[#2A2A3A]">
              <div className="flex justify-between text-xs text-[#8B8BA7] mb-2">
                <span>Work needed</span>
                <span className={totalHoursNeeded > availableHours ? 'text-red-400 font-semibold' : 'text-teal-400 font-semibold'}>
                  {totalHoursNeeded}h / {availableHours}h available
                </span>
              </div>
              <div className="h-2 bg-[#2A2A3A] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    totalHoursNeeded > availableHours
                      ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : 'bg-gradient-to-r from-purple-500 to-teal-500'
                  )}
                  style={{
                    width: `${Math.min((totalHoursNeeded / availableHours) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#4A4A6A] mt-2 font-medium">
                {pendingTasks.length} pending tasks
              </p>
            </div>
          </div>
        </div>

        {/* Goal input */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-semibold text-[#F0F0FF]">
            What&apos;s your main goal today?{' '}
            <span className="text-[#4A4A6A] font-normal text-xs">(optional)</span>
          </label>
          <input
            id="ai-goal-input"
            type="text"
            placeholder="e.g., Finish the client presentation by 5pm"
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
            className="input-dark h-12"
          />
        </div>

        {/* Analyze Button */}
        <button
          id="btn-run-analysis"
          onClick={runAnalysis}
          disabled={isAnalyzing || tasksLoading || pendingTasks.length === 0}
          className="mt-6 w-full h-12 btn-primary flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gemini is analyzing your tasks...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              {analysis ? 'Re-Analyze with Gemini' : 'Analyze My Tasks with AI'}
            </>
          )}
        </button>

        {pendingTasks.length === 0 && !tasksLoading && (
          <p className="text-xs text-[#8B8BA7] text-center mt-3">
            Add tasks from the &quot;My Tasks&quot; page first.
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Loading shimmer */}
      {isAnalyzing && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
          <p className="text-center text-sm text-[#8B8BA7] animate-pulse mt-2">
            Gemini AI is reading your tasks and building your personalized plan...
          </p>
        </div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Refresh hint */}
            <div className="flex items-center justify-between text-xs text-[#4A4A6A]">
              <span>Analysis complete</span>
              <button
                onClick={runAnalysis}
                className="flex items-center gap-1 hover:text-[#8B8BA7] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {/* Overload Alert */}
            {analysis.overloadDetected && analysis.overloadMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-5"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1">⚠️ Overload Detected</p>
                  <p className="text-sm text-[#F0F0FF] leading-relaxed">{analysis.overloadMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium text-[#F0F0FF] italic">&quot;{analysis.motivationalMessage}&quot;</p>
            </div>

            {/* Briefing */}
            <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection('briefing')}
                className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-semibold text-[#F0F0FF]">AI Briefing</span>
                </div>
                {expandedSection === 'briefing' ? (
                  <ChevronUp className="w-4 h-4 text-[#8B8BA7]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8B8BA7]" />
                )}
              </button>
              <AnimatePresence>
                {expandedSection === 'briefing' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <div className="h-px bg-[#2A2A3A] mb-4" />
                      <p className="text-sm text-[#F0F0FF] leading-relaxed">{analysis.briefing}</p>
                      {analysis.recommendation && (
                        <div className="mt-4 flex items-start gap-2 bg-[#1C1C27] rounded-xl p-3 border border-[#2A2A3A]">
                          <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#F0F0FF]"><strong className="text-yellow-400">Recommendation: </strong>{analysis.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prioritized Tasks */}
            {analysis.prioritizedTasks && analysis.prioritizedTasks.length > 0 && (
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('priority')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="font-semibold text-[#F0F0FF]">Smart Prioritization</span>
                    <span className="text-xs text-[#8B8BA7] bg-white/5 px-2 py-0.5 rounded-full">
                      {analysis.prioritizedTasks.length} tasks ranked
                    </span>
                  </div>
                  {expandedSection === 'priority' ? (
                    <ChevronUp className="w-4 h-4 text-[#8B8BA7]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8B8BA7]" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSection === 'priority' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <div className="h-px bg-[#2A2A3A] mb-4" />
                        <div className="space-y-3">
                          {analysis.prioritizedTasks.map((pt) => (
                            <div
                              key={pt.rank}
                              className="flex items-start gap-3 p-3 bg-[#1C1C27] rounded-xl border border-[#2A2A3A]"
                            >
                              <span className={cn(
                                'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border',
                                priorityColors[String(pt.rank)] || priorityColors['5']
                              )}>
                                #{pt.rank}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-[#F0F0FF]">{pt.taskId}</p>
                                <p className="text-xs text-[#8B8BA7] mt-0.5 leading-relaxed">{pt.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Schedule */}
            {analysis.schedule && analysis.schedule.length > 0 && (
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('schedule')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-semibold text-[#F0F0FF]">Today&apos;s Schedule</span>
                    <span className="text-xs text-[#8B8BA7] bg-white/5 px-2 py-0.5 rounded-full">
                      {analysis.schedule.length} blocks
                    </span>
                  </div>
                  {expandedSection === 'schedule' ? (
                    <ChevronUp className="w-4 h-4 text-[#8B8BA7]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8B8BA7]" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSection === 'schedule' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <div className="h-px bg-[#2A2A3A] mb-4" />
                        <div className="space-y-0">
                          {analysis.schedule.map((block, i) => (
                            <div key={i} className="flex gap-4 group">
                              {/* Timeline */}
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                                {i < analysis.schedule.length - 1 && (
                                  <div className="w-px flex-1 bg-[#2A2A3A] min-h-8" />
                                )}
                              </div>
                              {/* Content */}
                              <div className="pb-4 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-purple-400 font-mono font-bold">{block.time}</span>
                                  <span className="text-xs text-[#4A4A6A]">·</span>
                                  <span className="text-xs text-[#8B8BA7]">{block.duration}</span>
                                </div>
                                <p className="text-sm font-semibold text-[#F0F0FF] mt-0.5">{block.taskTitle}</p>
                                {block.note && (
                                  <p className="text-xs text-[#8B8BA7] mt-0.5">{block.note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('risks')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="font-semibold text-[#F0F0FF]">Risk Alerts</span>
                    <span className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                      {analysis.risks.length} at risk
                    </span>
                  </div>
                  {expandedSection === 'risks' ? (
                    <ChevronUp className="w-4 h-4 text-[#8B8BA7]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8B8BA7]" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSection === 'risks' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <div className="h-px bg-[#2A2A3A] mb-4" />
                        <div className="space-y-3">
                          {analysis.risks.map((risk, i) => (
                            <div
                              key={i}
                              className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl"
                            >
                              <p className="text-sm font-semibold text-orange-400 mb-1">
                                ⚠️ {risk.taskTitle}
                              </p>
                              <p className="text-xs text-[#8B8BA7] mb-2">{risk.risk}</p>
                              <div className="flex items-start gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-teal-400">{risk.recommendation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty prompt (no analysis yet) */}
      {!analysis && !isAnalyzing && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-5 animate-pulse-glow">
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-[#F0F0FF] mb-2">Ready to analyze</h3>
          <p className="text-[#8B8BA7] text-sm max-w-sm mx-auto leading-relaxed">
            Configure your available hours, optionally set a goal, and click{' '}
            <strong className="text-purple-400">Analyze My Tasks</strong> to get your personalized AI action plan.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#4A4A6A]">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Daily Briefing</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-purple-400" /> Smart Priority</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Auto Schedule</span>
            <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Risk Alerts</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
