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
  upload: async <T>(path: string, file: File, onProgress?: (pct: number) => void): Promise<T> => {    return new Promise((resolve, reject) => {
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
  /**
   * POSTs to a Server-Sent-Events endpoint and yields `{ event, data }`
   * pairs as they arrive. The backend's SSE endpoints (interview
   * start/answer/messages `/stream` routes) all use named events
   * (`chunk`, `done`, `error`, ...) with a single JSON payload per event.
   */
  /**
   * Fetches a binary endpoint (e.g. a PDF report) with the auth header
   * attached and triggers a browser download — a plain <a href> can't
   * carry the Bearer token this app uses, so direct navigation to a
   * protected download route would 401.
   */
  download: async (path: string, filename: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: getAuthHeader() })
    if (!res.ok) {
      let message = res.statusText
      try {
        const json = await res.json()
        message = json?.message ?? message
      } catch {
        /* no-op */
      }
      throw new ApiError(message, res.status)
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
  stream: async function* (
    path: string,
    body?: unknown
  ): AsyncGenerator<{ event: string; data: any }, void, unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok || !res.body) {
      let message = res.statusText
      try {
        const json = await res.json()
        message = json?.message ?? message
      } catch {
        /* no-op */
      }
      throw new ApiError(message, res.status)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const chunks = buffer.split("\n\n")
      buffer = chunks.pop() ?? ""

      for (const chunk of chunks) {
        const lines = chunk.split("\n")
        let event = "message"
        let data = ""
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim()
          if (line.startsWith("data:")) data = line.slice(5).trim()
        }
        if (!data) continue
        try {
          yield { event, data: JSON.parse(data) }
        } catch {
          /* ignore malformed frame */
        }
      }
    }
  },
}

export { ApiError }
