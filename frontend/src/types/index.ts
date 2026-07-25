export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface Resume {
  id: string
  fileName: string
  status: "uploading" | "parsing" | "ready" | "error"
  uploadedAt: string
  summary?: string
  skills?: string[]
}

export type InterviewType = "behavioral" | "technical" | "system-design" | "case-study"
export type Difficulty = "easy" | "medium" | "hard"

export interface InterviewConfig {
  type: InterviewType
  role: string
  difficulty: Difficulty
  durationMinutes: number
  resumeId?: string
}

export interface InterviewSession {
  id: string
  config: InterviewConfig
  status: "scheduled" | "in-progress" | "completed"
  startedAt?: string
  completedAt?: string
}

export interface InterviewQuestion {
  id: string
  index: number
  total: number
  prompt: string
}

export interface InterviewMessage {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: string
}

export interface FeedbackScoreCategory {
  label: string
  score: number // 0-100
}

export interface InterviewFeedback {
  sessionId: string
  overallScore: number
  categories: FeedbackScoreCategory[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  trend?: { date: string; score: number }[]
}

export interface DashboardStats {
  totalInterviews: number
  averageScore: number
  hoursPracticed: number
  currentStreak: number
  lastWeekAverage: number
  improvementPercentage: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}
