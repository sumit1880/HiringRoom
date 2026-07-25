import { api } from "./apiClient"
import { USE_MOCKS, delay, mockStats, mockAchievements, mockRecentSessions, mockScoreTrend } from "./mockData"
import type { Achievement, DashboardStats, InterviewSession } from "@/types"

// Backend wraps every response as { success, message, data }.
type ApiEnvelope<T> = { success: boolean; message?: string; data: T }

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    if (USE_MOCKS) return delay(mockStats)
    const res = await api.get<ApiEnvelope<DashboardStats>>("/dashboard/stats")
    return res.data
  },
  getRecentSessions: async (): Promise<InterviewSession[]> => {
    if (USE_MOCKS) return delay(mockRecentSessions)
    const res = await api.get<ApiEnvelope<InterviewSession[]>>("/dashboard/recent-sessions")
    return res.data
  },
  getAchievements: async (): Promise<Achievement[]> => {
    if (USE_MOCKS) return delay(mockAchievements)
    const res = await api.get<ApiEnvelope<Achievement[]>>("/dashboard/achievements")
    return res.data
  },
  getScoreTrend: async (): Promise<{ date: string; score: number }[]> => {
    if (USE_MOCKS) return delay(mockScoreTrend)
    const res = await api.get<ApiEnvelope<{ date: string; score: number }[]>>("/dashboard/score-trend")
    return res.data
  },
}
