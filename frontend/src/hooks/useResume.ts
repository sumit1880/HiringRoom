import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { resumeService } from "@/services/resumeService"

export function useResume() {
  return useQuery({
    queryKey: ["resume"],
    queryFn: resumeService.getCurrent,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === "uploading" || status === "parsing" ? 2000 : false
    },
  })
}

export function useResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: resumeService.getAll,
    refetchInterval: (query) => {
      const anyProcessing = query.state.data?.some(
        (r) => r.status === "uploading" || r.status === "parsing"
      )
      return anyProcessing ? 2000 : false
    },
  })
}


export function useUploadResume(onProgress?: (pct: number) => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => resumeService.upload(file, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume"] })
      qc.invalidateQueries({ queryKey: ["resumes"] })
      toast.success("Resume parsed and ready")
    },
    onError: () => toast.error("Couldn't upload your resume. Try again."),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume"] })
      qc.invalidateQueries({ queryKey: ["resumes"] })
      toast.success("Resume removed")
    },
    onError: () => toast.error("Couldn't remove your resume. Try again."),
  })
}

export function useScoreResumeATS() {
  return useMutation({
    mutationFn: ({ id, jobDescription }: { id: string; jobDescription?: string }) =>
      resumeService.scoreATS(id, jobDescription),
    onError: () => toast.error("Couldn't score this resume right now. Try again."),
  })
}

export function useRetryResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeService.retry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume"] })
      qc.invalidateQueries({ queryKey: ["resumes"] })
      toast.success("Resume processing restarted")
    },
    onError: () => toast.error("Couldn't retry resume processing. Try again."),
  })
}