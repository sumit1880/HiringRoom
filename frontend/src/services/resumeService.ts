import { api } from "./apiClient"
import { USE_MOCKS, delay, mockResume, mockResumes } from "./mockData"
import type { Resume } from "@/types"

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
    if (USE_MOCKS) return delay(mockResume)
    const res = await api.get<ApiEnvelope<BackendResume[]>>("/resumes")
    const [latest] = res.data
    return latest ? toResume(latest) : null
  },
  // Full list, used by the interview-setup resume picker so the user can
  // choose which uploaded resume a given interview should be based on.
  getAll: async (): Promise<Resume[]> => {
    if (USE_MOCKS) return delay(mockResumes)
    const res = await api.get<ApiEnvelope<BackendResume[]>>("/resumes")
    return res.data.map(toResume)
  },
  upload: async (file: File, onProgress?: (pct: number) => void): Promise<Resume> => {
    if (USE_MOCKS) {
      for (let pct = 0; pct <= 100; pct += 20) {
        // eslint-disable-next-line no-await-in-loop
        await delay(undefined, 150)
        onProgress?.(pct)
      }
      return delay({ ...mockResume, fileName: file.name, status: "ready" }, 400)
    }
    const res = await api.upload<ApiEnvelope<BackendResume>>("/resumes/upload", file, onProgress)
    return toResume(res.data)
  },
  delete: async (id: string): Promise<void> => {
    if (USE_MOCKS) return delay(undefined, 300)
    await api.delete(`/resumes/${id}`)
  },
}