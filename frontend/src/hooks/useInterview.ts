import { useMutation, useQuery } from "@tanstack/react-query"
import { interviewService } from "@/services/interviewService"
import type { InterviewConfig } from "@/types"

export function useCreateSession() {
  return useMutation({ mutationFn: (config: InterviewConfig) => interviewService.createSession(config) })
}
export function useStartInterview() {
  return useMutation({ mutationFn: (sessionId: string) => interviewService.startInterview(sessionId) })
}
export function useQuestions(sessionId: string) {
  return useQuery({ queryKey: ["interview", sessionId, "questions"], queryFn: () => interviewService.getQuestions(sessionId), enabled: !!sessionId })
}
export function useSubmitAnswer(sessionId: string) {
  return useMutation({ mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) => interviewService.submitAnswer(sessionId, questionId, answer) })
}
