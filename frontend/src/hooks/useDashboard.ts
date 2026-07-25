import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboardService"

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardService.getStats })
}
export function useRecentSessions() {
  return useQuery({ queryKey: ["dashboard", "recent-sessions"], queryFn: dashboardService.getRecentSessions })
}
export function useAchievements() {
  return useQuery({ queryKey: ["dashboard", "achievements"], queryFn: dashboardService.getAchievements })
}
export function useScoreTrend() {
  return useQuery({ queryKey: ["dashboard", "score-trend"], queryFn: dashboardService.getScoreTrend })
}
