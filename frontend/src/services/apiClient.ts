/**
 * Central HTTP client for the existing backend.
 *
 * This file intentionally contains NO business logic and NO assumptions
 * about response shapes beyond generic JSON handling — it is the single
 * seam where this frontend talks to your real API.
 *
 * Point it at your backend by setting VITE_API_BASE_URL in `.env`
 * (see `.env.example`). Attach real auth (cookies / bearer token) in the
 * `getAuthHeader` hook below to match your existing auth scheme —
 * nothing here renames payloads, invents endpoints, or changes contracts.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("access_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...options.headers,
    },
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body?.message ?? message
    } catch {
      /* no-op: body wasn't JSON */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: async <T>(path: string, file: File, onProgress?: (pct: number) => void): Promise<T> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append("resume", file)

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
      })
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new ApiError(xhr.statusText, xhr.status))
        }
      })
      xhr.addEventListener("error", () => reject(new ApiError("Upload failed", 0)))
      xhr.open("POST", `${BASE_URL}${path}`)
      const auth = getAuthHeader().Authorization
      if (auth) xhr.setRequestHeader("Authorization", auth)
      xhr.send(formData)
    })
  },
}

export { ApiError }
