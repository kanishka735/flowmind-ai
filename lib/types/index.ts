export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'
export type Difficulty = 1 | 2 | 3 | 4 | 5
export type Category = 'work' | 'study' | 'personal' | 'health' | 'finance' | 'other'

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  deadline: string // ISO date string YYYY-MM-DD
  estimatedDuration: number // minutes
  actualDuration?: number
  category: Category
  difficulty: Difficulty
  progress: number // 0-100
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface UserProfile {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  isGuest: boolean
}

export interface PrioritizedTask {
  taskId: string
  rank: number
  reason: string
}

export interface ScheduleBlock {
  time: string
  taskTitle: string
  duration: string
  note: string
}

export interface RiskItem {
  taskTitle: string
  risk: string
  recommendation: string
}

export interface AIAnalysis {
  briefing: string
  overloadDetected: boolean
  overloadMessage?: string
  prioritizedTasks: PrioritizedTask[]
  schedule: ScheduleBlock[]
  risks: RiskItem[]
  recommendation: string
  motivationalMessage: string
}

export interface AnalyzeRequest {
  tasks: Task[]
  availableHours: number
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  userGoal?: string
}
