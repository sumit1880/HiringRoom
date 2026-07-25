import { api } from "./apiClient"
import { USE_MOCKS, delay, mockQuestions, mockTranscript } from "./mockData"
import type { InterviewConfig, InterviewMessage, InterviewQuestion, InterviewSession } from "@/types"

// Backend wraps every response as { success, message, data }.
type ApiEnvelope<T> = { success: boolean; message?: string; data: T }

// Backend question shape (no id/total — it's generated one at a time).
type BackendQuestion = { questionNumber: number; question: string }

// startInterview's response additionally carries the session's true
// duration + start time, so the live page can initialize its countdown
// from real backend data instead of a hardcoded value, and recompute it
// correctly after a refresh.
type BackendStartResponse = BackendQuestion & {
  durationMinutes: number
  startedAt: string
}

const toInterviewQuestion = (q: BackendQuestion): InterviewQuestion => ({
  id: `q-${q.questionNumber}`,
  index: q.questionNumber,
  total: q.questionNumber,
  prompt: q.question,
})


// Backend now has a matching enum value for every frontend type.
const toBackendType = (type: InterviewConfig["type"]): "DSA" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CASE_STUDY" => {
  switch (type) {
    case "technical":
      return "DSA"
    case "system-design":
      return "SYSTEM_DESIGN"
    case "case-study":
      return "CASE_STUDY"
    case "behavioral":
    default:
      return "BEHAVIORAL"
  }
}

type BackendSession = {
  id: string
  title: string
  type: "DSA" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CASE_STUDY"
  status: string
  startedAt: string
  endedAt: string | null
}

const toInterviewSession = (s: BackendSession, config: InterviewConfig): InterviewSession => ({
  id: s.id,
  config,
  status: s.status === "COMPLETED" ? "completed" : s.status === "IN_PROGRESS" ? "in-progress" : "scheduled",
  startedAt: s.startedAt,
  completedAt: s.endedAt ?? undefined,
})


export const interviewService = {
createSession: async (config: InterviewConfig): Promise<InterviewSession> => {
  if (USE_MOCKS) return delay({ id: "s_new", config, status: "in-progress", startedAt: new Date().toISOString() })
  if (!config.resumeId) {
    throw new Error("Please select a resume before starting an interview.")
  }
  const title = `${config.role} — ${config.type} interview`.slice(0, 100)
  const res = await api.post<ApiEnvelope<BackendSession>>("/interviews", {
    title,
    type: toBackendType(config.type),
    difficulty: config.difficulty,
    resumeId: config.resumeId,
    durationMinutes: config.durationMinutes,
  })
  return toInterviewSession(res.data, config)
},
  // Generates question #1 for the session (or returns the existing one on
  // refresh). Returns the session's real duration/startedAt alongside the
  // question so the live page's timer is always backend-driven.
  startInterview: async (sessionId: string): Promise<{ question: InterviewQuestion; durationMinutes: number; startedAt: string }> => {
    if (USE_MOCKS) {
      return delay({ question: mockQuestions[0], durationMinutes: 30, startedAt: new Date().toISOString() })
    }
    const res = await api.post<ApiEnvelope<BackendStartResponse>>(`/interviews/${sessionId}/start`)
    return {
      question: toInterviewQuestion(res.data),
      durationMinutes: res.data.durationMinutes,
      startedAt: res.data.startedAt,
    }
  },
  getQuestions: async (sessionId: string): Promise<InterviewQuestion[]> => {
    if (USE_MOCKS) return delay(mockQuestions)
    return api.get(`/interviews/${sessionId}/questions`)
  },
  getTranscript: async (sessionId: string): Promise<InterviewMessage[]> => {
    if (USE_MOCKS) return delay(mockTranscript)
    return api.get(`/interviews/${sessionId}/transcript`)
  },
  submitAnswer: async (sessionId: string, questionId: string, answer: string): Promise<{ nextQuestion?: InterviewQuestion }> => {
    if (USE_MOCKS) {
      const idx = mockQuestions.findIndex((q) => q.id === questionId)
      return delay({ nextQuestion: mockQuestions[idx + 1] })
    }
    // Backend infers the current pending question server-side; it only needs the answer text.
    const res = await api.post<ApiEnvelope<{ evaluation: unknown; nextQuestion: BackendQuestion }>>(
      `/interviews/${sessionId}/answer`,
      { answer }
    )
    return { nextQuestion: res.data.nextQuestion ? toInterviewQuestion(res.data.nextQuestion) : undefined }
  },
  completeSession: async (sessionId: string): Promise<void> => {
    if (USE_MOCKS) return delay(undefined, 400)
   await api.patch(`/interviews/${sessionId}/complete`)
  },
}
