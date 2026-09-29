import { api } from "./apiClient"

import type { AtsScore, Resume } from "@/types"

// Backend wraps every response as { success, message, data }.
type ApiEnvelope<T> = { success: boolean; message?: string; data: T }

// Raw shape returned by the backend's Prisma `Resume` model — field names
// don't match the frontend's `Resume` type, so we map explicitly below.
interface BackendResume {
  id: string
  originalName: string
  mimeType: string
  fileUrl: string
  extractedText?: string | null
  embeddingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  uploadedAt: string
  userId: string
}

const STATUS_MAP: Record<BackendResume["embeddingStatus"], Resume["status"]> = {
  PENDING: "uploading",
  PROCESSING: "parsing",
  COMPLETED: "ready",
  FAILED: "error",
}

function toResume(r: BackendResume): Resume {
  return {
    id: r.id,
    fileName: r.originalName,
    status: STATUS_MAP[r.embeddingStatus],
    uploadedAt: r.uploadedAt,
    // Backend doesn't generate an AI summary or skill list today — left
    // undefined on purpose, the UI already renders fine without them.
  }
}

export const resumeService = {
  // Backend supports multiple resumes (GET /resumes returns a list,
  // ordered most-recent-first); this UI only shows one at a time, so we
  // surface the most recently uploaded one.
  getCurrent: async (): Promise<Resume | null> => {
    const res = await api.get<ApiEnvelope<BackendResume[]>>("/resumes")
    const [latest] = res.data
    return latest ? toResume(latest) : null
  },
  // Full list, used by the interview-setup resume picker so the user can
  // choose which uploaded resume a given interview should be based on.
  getAll: async (): Promise<Resume[]> => {
    const res = await api.get<ApiEnvelope<BackendResume[]>>("/resumes")
    return res.data.map(toResume)
  },
  upload: async (file: File, onProgress?: (pct: number) => void): Promise<Resume> => {
    const res = await api.upload<ApiEnvelope<BackendResume>>("/resumes/upload", file, onProgress)
    return toResume(res.data)
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/resumes/${id}`)
  },
  retry: async (id: string): Promise<Resume> => {
    const res = await api.post<ApiEnvelope<BackendResume>>(`/resumes/${id}/retry`)
    return toResume(res.data)
  },

  /** ATS-style scoring of a resume, optionally targeted at a job description. */
  scoreATS: async (id: string, jobDescription?: string): Promise<AtsScore> => {
    const res = await api.post<{ success: boolean; data: AtsScore }>(`/resumes/${id}/score`, {
      jobDescription: jobDescription || undefined,
    })
    return res.data
  },
}