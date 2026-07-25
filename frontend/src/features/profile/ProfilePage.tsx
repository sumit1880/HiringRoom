import { motion } from "framer-motion"
import { Award, Lock, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/shared/States"
import { ScrollReveal } from "@/components/shared/motion"

import { useAuth } from "@/hooks/useAuth"
import { useDashboardStats, useRecentSessions, useAchievements } from "@/hooks/useDashboard"
import { api } from "@/services/apiClient"

type ProfileSummary = {
  memberSince: string
  interviewsCompleted: number
  averageScore: number
  currentStreak: number
  skillProgress: {
    communication: number
    technicalDepth: number
    problemSolving: number
    systemDesign: number
  }
}

export function ProfilePage() {
  const { user } = useAuth()

  // Real profile summary
 const { data: profileData, isLoading: profileLoading } = useQuery<ProfileSummary>({
  queryKey: ['profile', 'summary'],
  queryFn: async () => {
    const res = await api.get<{ success: boolean; data: ProfileSummary }>(
      '/profile/summary'
    )
    return res.data
  },
})

  // Existing dashboard hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: sessions, isLoading: sessionsLoading } = useRecentSessions()
  const { data: achievements, isLoading: achievementsLoading } = useAchievements()

  const initials = (user?.name ?? "User")
    .split(" ")
    .map((n) => n[0])
    .join("")

  const skillBars = [
    {
      name: "Communication",
      value: profileData?.skillProgress?.communication ?? 0,
    },
    {
      name: "Technical depth",
      value: profileData?.skillProgress?.technicalDepth ?? 0,
    },
    {
      name: "Problem solving",
      value: profileData?.skillProgress?.problemSolving ?? 0,
    },
    {
      name: "System design",
      value: profileData?.skillProgress?.systemDesign ?? 0,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <ScrollReveal className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar className="h-20 w-20 border border-white/10">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-semibold">
            {user?.name ?? "User"}
          </h1>

          <p className="text-muted-foreground">
            {user?.email ?? "user@example.com"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Member since{" "}
            {profileLoading
              ? "Loading..."
              : new Date(
                  profileData?.memberSince ?? Date.now()
                ).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
          </p>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          : [
              {
                label: "Interviews",
                value: stats?.totalInterviews ?? 0,
              },
              {
                label: "Avg score",
                value: `${stats?.averageScore ?? 0}%`,
              },
              {
                label: "Streak",
                value: `${stats?.currentStreak ?? 0}d`,
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5 text-center">
                  <p className="font-display text-2xl font-semibold">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Skill Progress */}
      <ScrollReveal>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Skill progress
            </CardTitle>
            <CardDescription>
              Rolling average across your real interview evaluations
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {profileLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              : skillBars.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">
                        {s.value}%
                      </span>
                    </div>

                    <Progress value={s.value} />
                  </div>
                ))}
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Achievements */}
      <ScrollReveal>
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievementsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              : achievements?.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center ${
                      a.unlocked
                        ? "glass"
                        : "border border-dashed border-white/10 opacity-50"
                    }`}
                  >
                    {a.unlocked ? (
                      <Award className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}

                    <p className="text-xs font-medium">{a.title}</p>

                    <p className="text-[10px] text-muted-foreground">
                      {a.description}
                    </p>
                  </motion.div>
                ))}
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Activity Timeline */}
      <ScrollReveal>
        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
          </CardHeader>

          <CardContent className="space-y-1">
            {sessionsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))
              : sessions?.length
              ? sessions.map((s, i) => (
                  <div
                    key={s.id}
                    className="relative flex gap-4 pb-6 pl-2 last:pb-0"
                  >
                    {i !== sessions.length - 1 && (
                      <div className="absolute left-[7px] top-4 h-full w-px bg-white/10" />
                    )}

                    <div className="relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary" />

                    <div>
                      <p className="text-sm font-medium capitalize">
                        {s.config.type.replace("-", " ")} interview completed
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {s.completedAt &&
                          new Date(s.completedAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className="ml-auto h-fit capitalize"
                    >
                      {s.config.difficulty}
                    </Badge>
                  </div>
                ))
              : (
                <p className="text-sm text-muted-foreground">
                  No interview activity yet.
                </p>
              )}
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  )
}