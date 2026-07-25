/**
 * Demo data so the UI is fully explorable with `npm run dev` and no backend
 * running. Every service function below is written to call `api.*` first —
 * swap the `USE_MOCKS` flag off (or delete the mock branch) once your real
 * endpoints are wired up. Nothing in the components imports this file
 * directly; they only ever go through `src/services/*`.
 */
import type {
  Achievement,
  DashboardStats,
  InterviewFeedback,
  InterviewMessage,
  InterviewQuestion,
  InterviewSession,
  Resume,
  User,
} from "@/types"

export const USE_MOCKS = false

export const mockUser: User = {
  id: "usr_1",
  name: "Alex Rivera",
  email: "alex@example.com",
  createdAt: "2025-01-14T00:00:00Z",
}

export const mockStats: DashboardStats = {
  totalInterviews: 27,
  averageScore: 82,
  hoursPracticed: 14.5,
  currentStreak: 6,
  lastWeekAverage: 84,
  improvementPercentage: 8,
}

export const mockResume: Resume = {
  id: "res_1",
  fileName: "alex-rivera-resume.pdf",
  status: "ready",
  uploadedAt: "2026-07-01T10:00:00Z",
  summary:
    "Senior frontend engineer with 6 years building design systems and performant React applications. Strong in TypeScript, accessibility, and cross-functional collaboration.",
  skills: ["React", "TypeScript", "System Design", "GraphQL", "Accessibility", "Testing"],
}

export const mockResumes: Resume[] = [mockResume]

export const mockAchievements: Achievement[] = [
  { id: "a1", title: "First Steps", description: "Completed your first mock interview", unlocked: true, unlockedAt: "2026-02-01" },
  { id: "a2", title: "Consistent", description: "6-day practice streak", unlocked: true, unlockedAt: "2026-07-10" },
  { id: "a3", title: "Sharp Shooter", description: "Scored 90+ on a technical round", unlocked: true, unlockedAt: "2026-06-20" },
  { id: "a4", title: "Marathoner", description: "Completed a 60-minute session", unlocked: false },
]

export const mockRecentSessions: InterviewSession[] = [
  { id: "s1", config: { type: "technical", role: "Frontend Engineer", difficulty: "hard", durationMinutes: 45 }, status: "completed", completedAt: "2026-07-13T14:00:00Z" },
  { id: "s2", config: { type: "behavioral", role: "Frontend Engineer", difficulty: "medium", durationMinutes: 30 }, status: "completed", completedAt: "2026-07-10T09:00:00Z" },
  { id: "s3", config: { type: "system-design", role: "Senior Frontend Engineer", difficulty: "hard", durationMinutes: 60 }, status: "completed", completedAt: "2026-07-06T16:00:00Z" },
]

export const mockScoreTrend = [
  { date: "Jun 1", score: 68 },
  { date: "Jun 8", score: 71 },
  { date: "Jun 15", score: 75 },
  { date: "Jun 22", score: 74 },
  { date: "Jun 29", score: 79 },
  { date: "Jul 6", score: 81 },
  { date: "Jul 13", score: 86 },
]

export const mockQuestions: InterviewQuestion[] = [
  { id: "q1", index: 1, total: 5, prompt: "Tell me about a time you had to push back on a technical decision. What happened?" },
  { id: "q2", index: 2, total: 5, prompt: "How would you architect a component library that's shared across five product teams?" },
  { id: "q3", index: 3, total: 5, prompt: "Walk me through how you'd debug a memory leak in a long-running React app." },
  { id: "q4", index: 4, total: 5, prompt: "Describe a project where the requirements changed significantly midway through. How did you adapt?" },
  { id: "q5", index: 5, total: 5, prompt: "What tradeoffs would you consider when choosing between client-side and server-side rendering?" },
]

export const mockTranscript: InterviewMessage[] = [
  { id: "m1", role: "ai", content: "Welcome, Alex. Let's start with something you know well.", timestamp: "10:00" },
  { id: "m2", role: "ai", content: mockQuestions[0].prompt, timestamp: "10:00" },
]

export const mockFeedback: InterviewFeedback = {
  sessionId: "s1",
  overallScore: 86,
  categories: [
    { label: "Communication", score: 88 },
    { label: "Technical depth", score: 82 },
    { label: "Problem solving", score: 90 },
    { label: "Structure", score: 79 },
    { label: "Confidence", score: 85 },
  ],
  strengths: [
    "Clear, structured answers using STAR framing",
    "Strong grasp of rendering performance tradeoffs",
    "Asked clarifying questions before diving in",
  ],
  weaknesses: [
    "Occasionally rushed through edge cases",
    "Could quantify impact more with concrete metrics",
  ],
  recommendations: [
    "Practice narrating tradeoffs out loud before settling on an answer",
    "Prepare 2-3 metrics-backed stories for behavioral rounds",
    "Time-box system design answers to leave room for Q&A",
  ],
  trend: mockScoreTrend,
}

export function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
