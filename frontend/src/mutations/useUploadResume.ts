import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


import { uploadResume } from "../api/resume.api";

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,

    onSuccess: () => {
      toast.success("Resume uploaded successfully");

      queryClient.invalidateQueries({
        queryKey: ["resumes"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Resume upload failed"
      );
    },
  });
}