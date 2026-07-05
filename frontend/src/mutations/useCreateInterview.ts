import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createInterview } from "../api/interview.api";

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInterview,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["interviews"],
      });
    },
  });
}