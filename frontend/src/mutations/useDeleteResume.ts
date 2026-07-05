import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteResume } from "../api/resume.api";

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,

    onSuccess: () => {
      toast.success("Resume deleted");

      queryClient.invalidateQueries({
        queryKey: ["resumes"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Delete failed"
      );
    },
  });
}