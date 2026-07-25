import { useQuery } from "@tanstack/react-query"
import { feedbackService } from "@/services/feedbackService"

export function useFeedback(sessionId: string) {
  return useQuery({ queryKey: ["feedback", sessionId], queryFn: () => feedbackService.getFeedback(sessionId), enabled: !!sessionId })
}
