import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { resumeService } from "@/services/resumeService"

export function useResume() {
  return useQuery({ queryKey: ["resume"], queryFn: resumeService.getCurrent })
}

export function useResumes() {
  return useQuery({ queryKey: ["resumes"], queryFn: resumeService.getAll })
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