import { api } from "./apiClient"

import type { Achievement, DashboardStats, InterviewSession } from "@/types"

// Backend wraps every response as { success, message, data }.
type ApiEnvelope<T> = { success: boolean; message?: string; data: T }

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiEnvelope<DashboardStats>>("/dashboard/stats")
    return res.data
  },
  getRecentSessions: async (): Promise<InterviewSession[]> => {
    const res = await api.get<ApiEnvelope<InterviewSession[]>>("/dashboard/recent-sessions")
    return res.data
  },
  getAchievements: async (): Promise<Achievement[]> => {
    const res = await api.get<ApiEnvelope<Achievement[]>>("/dashboard/achievements")
    return res.data
  },
  getScoreTrend: async (): Promise<{ date: string; score: number }[]> => {
    const res = await api.get<ApiEnvelope<{ date: string; score: number }[]>>("/dashboard/score-trend")
    return res.data
  },
}
