import { api } from "./apiClient"
import { USE_MOCKS, delay, mockQuestions, mockTranscript } from "./mockData"
import { JsonFieldStreamExtractor } from "@/lib/jsonFieldStream"
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
    jobDescription: config.jobDescription || undefined,
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
  /**
   * SSE variant of startInterview — calls onPartialQuestion as the
   * question text is generated (for a "typing in" effect), then resolves
   * with the same shape startInterview() returns once the stream
   * completes.
   */
  startInterviewStream: async (
    sessionId: string,
    onPartialQuestion: (text: string) => void
  ): Promise<{ question: InterviewQuestion; durationMinutes: number; startedAt: string }> => {
    if (USE_MOCKS) {
      onPartialQuestion(mockQuestions[0].prompt)
      return delay({ question: mockQuestions[0], durationMinutes: 30, startedAt: new Date().toISOString() })
    }

    const extractor = new JsonFieldStreamExtractor("question")
    let finalData: BackendStartResponse | undefined

    for await (const { event, data } of api.stream(`/interviews/${sessionId}/start/stream`)) {
      if (event === "chunk") {
        const partial = extractor.push(data.text)
        if (partial) onPartialQuestion(partial)
      } else if (event === "done") {
        finalData = data as BackendStartResponse
      } else if (event === "error") {
        throw new Error(data.message ?? "Failed to start interview")
      }
    }

    if (!finalData) throw new Error("Interview start stream ended without a result.")

    return {
      question: toInterviewQuestion(finalData),
      durationMinutes: finalData.durationMinutes,
      startedAt: finalData.startedAt,
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
  /**
   * SSE variant of submitAnswer — calls onPartialQuestion as the next
   * question's text is generated. The evaluation itself isn't streamed
   * (it's a small structured payload the UI doesn't reveal character by
   * character) — only available once the stream completes.
   */
  submitAnswerStream: async (
    sessionId: string,
    _questionId: string,
    answer: string,
    onPartialQuestion: (text: string) => void
  ): Promise<{ nextQuestion?: InterviewQuestion; evaluation?: unknown }> => {
    if (USE_MOCKS) {
      const idx = mockQuestions.findIndex((q) => q.prompt)
      const next = mockQuestions[idx + 1]
      if (next) onPartialQuestion(next.prompt)
      return delay({ nextQuestion: next })
    }

    const extractor = new JsonFieldStreamExtractor("nextQuestion")
    let finalData: { evaluation: unknown; nextQuestion: BackendQuestion } | undefined

    for await (const { event, data } of api.stream(`/interviews/${sessionId}/answer/stream`, { answer })) {
      if (event === "chunk") {
        const partial = extractor.push(data.text)
        if (partial) onPartialQuestion(partial)
      } else if (event === "done") {
        finalData = data
      } else if (event === "error") {
        throw new Error(data.message ?? "Failed to submit answer")
      }
    }

    if (!finalData) throw new Error("Answer stream ended without a result.")

    return {
      nextQuestion: finalData.nextQuestion ? toInterviewQuestion(finalData.nextQuestion) : undefined,
      evaluation: finalData.evaluation,
    }
  },
  completeSession: async (sessionId: string): Promise<void> => {
    if (USE_MOCKS) return delay(undefined, 400)
   await api.patch(`/interviews/${sessionId}/complete`)
  },
  /** Downloads the backend's PDF report for this session. */
  downloadReport: async (sessionId: string): Promise<void> => {
    if (USE_MOCKS) return delay(undefined, 300)
    await api.download(`/interviews/${sessionId}/report.pdf`, `interview-report-${sessionId}.pdf`)
  },
}
