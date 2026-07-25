import { api } from "./apiClient"
import { USE_MOCKS, delay, mockUser } from "./mockData"
import type { AuthTokens, User } from "@/types"

type ApiEnvelope<T> = { success: boolean; message?: string; data: T }

interface GoogleAuthResponseUser {
  id: string
  name: string
  email: string
  role: string
  profileImage?: string | null
}

function toUser(u: GoogleAuthResponseUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.profileImage ?? undefined,
    createdAt: new Date().toISOString(),
  }
}

export const authService = {
  google: async (idToken: string): Promise<{ user: User; tokens: AuthTokens }> => {
    if (USE_MOCKS) return delay({ user: mockUser, tokens: { accessToken: "mock_token" } })
    const res = await api.post<ApiEnvelope<{ token: string; user: GoogleAuthResponseUser }>>(
      "/auth/google",
      { idToken }
    )
    return { user: toUser(res.data.user), tokens: { accessToken: res.data.token } }
  },
  me: async (): Promise<User> => {
    if (USE_MOCKS) return delay(mockUser, 300)
    const res = await api.get<ApiEnvelope<User>>("/users/me")
    return res.data
  },
  logout: async (): Promise<void> => {
    if (USE_MOCKS) return delay(undefined, 200)
    await api.post("/auth/logout")
  },
  deleteAccount: async (): Promise<void> => {
    if (USE_MOCKS) return delay(undefined, 300)
    await api.delete("/users/me")
  },
}
