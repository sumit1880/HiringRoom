import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService } from "@/services/authService"
import type { User } from "@/types"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setIsLoading(false))
  }, [])

  const loginWithGoogle = async (idToken: string) => {
    const { user, tokens } = await authService.google(idToken)
    localStorage.setItem("access_token", tokens.accessToken)
    setUser(user)
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem("access_token")
    setUser(null)
  }

  const deleteAccount = async () => {
    await authService.deleteAccount()
    localStorage.removeItem("access_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, loginWithGoogle, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
