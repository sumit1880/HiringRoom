import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  startInterview,
  answerInterview,
} from "../api/interview.api";

export function useStartInterview() {
  return useMutation({
    mutationFn: startInterview,
  });
}

export function useAnswerInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      answer,
    }: {
      sessionId: string;
      answer: string;
    }) => answerInterview(sessionId, answer),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interviews"],
      });
    },
  });
}