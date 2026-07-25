import { api } from "./apiClient"
import { USE_MOCKS, delay, mockFeedback } from "./mockData"
import type { InterviewFeedback } from "@/types"

type ApiEnvelope<T> = { success: boolean; message?: string; data: T }

// Backend's Feedback row shape (strengths/weaknesses/suggestions stored as newline-joined text).
type BackendFeedback = {
  sessionId: string
  strengths: string
  weaknesses: string
  suggestions: string
  communicationScore: number
  technicalScore: number
  overallScore: number
}

const splitLines = (s: string): string[] =>
  s.split("\n").map((v) => v.trim()).filter(Boolean)

const toInterviewFeedback = (f: BackendFeedback): InterviewFeedback => ({
  sessionId: f.sessionId,
  overallScore: Math.round(f.overallScore),
  categories: [
    { label: "Technical", score: Math.round(f.technicalScore * 10) },
    { label: "Communication", score: Math.round(f.communicationScore * 10) },
  ],
  strengths: splitLines(f.strengths),
  weaknesses: splitLines(f.weaknesses),
  recommendations: splitLines(f.suggestions),
})

export const feedbackService = {
  getFeedback: async (sessionId: string): Promise<InterviewFeedback> => {
    if (USE_MOCKS) return delay({ ...mockFeedback, sessionId }, 900)
    const res = await api.get<ApiEnvelope<BackendFeedback>>(`/interviews/${sessionId}/feedback`)
    return toInterviewFeedback(res.data)
  },
  downloadReport: async (sessionId: string): Promise<Blob> => {
    if (USE_MOCKS) return new Blob(["Mock feedback report"], { type: "application/pdf" })
    const res = await fetch(`/api/interviews/${sessionId}/feedback/report`)
    return res.blob()
  },
}