import { api } from "./apiClient"

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
    const res = await api.post<ApiEnvelope<{ token: string; user: GoogleAuthResponseUser }>>(
      "/auth/google",
      { idToken }
    )
    return { user: toUser(res.data.user), tokens: { accessToken: res.data.token } }
  },
  devLogin: async (email?: string, name?: string): Promise<{ user: User; tokens: AuthTokens }> => {
    const res = await api.post<ApiEnvelope<{ token: string; user: GoogleAuthResponseUser }>>(
      "/auth/dev-login",
      { email, name }
    )
    return { user: toUser(res.data.user), tokens: { accessToken: res.data.token } }
  },

  me: async (): Promise<User> => {
    const res = await api.get<ApiEnvelope<User>>("/users/me")
    return res.data
  },
  logout: async (): Promise<void> => {
    // Stateless auth, no backend call needed
  },
  deleteAccount: async (): Promise<void> => {
    await api.delete("/users/me")
  },
}
