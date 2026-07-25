import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Award, ArrowUpRight, Sparkles, FileText, Mic, Trophy, Lock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/shared/States"
import { EmptyState } from "@/components/shared/States"
import { Orb } from "@/components/shared/Orb"
import { useRecentSessions, useAchievements, useDashboardStats } from "@/hooks/useDashboard"
import type { DashboardStats } from "@/types"

export function RecentInterviews() {
  const { data, isLoading } = useRecentSessions()
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent interviews</CardTitle>
          <CardDescription>Your last few practice sessions</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : !data?.length ? (
          <EmptyState
            icon={<Mic className="h-5 w-5" />}
            title="No interviews yet"
            description="Run your first mock interview to see it show up here."
            action={<Button size="sm" onClick={() => navigate("/interview/setup")}>Start an interview</Button>}
          />
        ) : (
          data.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 capitalize">
                <Mic className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium capitalize">{s.config.type.replace("-", " ")} · {s.config.role}</p>
                <p className="text-xs text-muted-foreground">{s.completedAt ? new Date(s.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "In progress"}</p>
              </div>
              <Badge variant="secondary" className="capitalize">{s.config.difficulty}</Badge>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function AchievementsCard() {
  const { data, isLoading } = useAchievements()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> Achievements</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : data?.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center ${a.unlocked ? "glass" : "border border-dashed border-white/10 opacity-50"}`}
              >
                {a.unlocked ? <Award className="h-5 w-5 text-amber-400" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                <p className="text-xs font-medium">{a.title}</p>
              </motion.div>
            ))}
      </CardContent>
    </Card>
  )
}

// Deterministic, data-only insight — no fabricated numbers or claims.
function buildInsight(stats: DashboardStats): string {
  const { averageScore, improvementPercentage, currentStreak } = stats

  if (improvementPercentage >= 10) {
    return `Your average score is up ${improvementPercentage}% over the last week. Keep that momentum going into your next session.`
  }
  if (averageScore > 0 && averageScore < 60) {
    return `Your average score is ${averageScore}%. Focus on strengthening fundamentals before your next interview.`
  }
  if (currentStreak < 2) {
    return `You're averaging ${averageScore}%. Practicing a little more consistently will help your scores climb faster.`
  }
  return `Solid consistency at a ${averageScore}% average — that steady communication and follow-through is a strong signal for interview day.`
}

export function AIInsights() {
  const { data, isLoading } = useDashboardStats()

  return (
    <Card className="gradient-border">
      <CardContent className="flex items-start gap-4 p-6">
        <Orb state="idle" size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">This week's insight</p>
          </div>
          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {!data || data.totalInterviews < 3
                ? "Complete at least 3 interviews to unlock personalized AI insights."
                : buildInsight(data)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActions() {
  const navigate = useNavigate()
  const actions = [
    { label: "Start interview", icon: Mic, to: "/interview/setup" },
    { label: "Update resume", icon: FileText, to: "/resume" },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => navigate(a.to)}
          className="group flex flex-col items-start gap-3 rounded-2xl glass p-5 text-left transition-colors hover:bg-white/[0.05]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <a.icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{a.label}</span>
        </button>
      ))}
    </div>
  )
}
