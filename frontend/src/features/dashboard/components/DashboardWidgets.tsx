import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Award, ArrowUpRight, Sparkles, FileText, Mic, Trophy, Lock, Search, ChevronRight, BarChart3, CheckCircle2, PlayCircle, Target } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/shared/States"
import { EmptyState } from "@/components/shared/States"
import { Orb } from "@/components/shared/Orb"
import { useRecentSessions, useAchievements, useDashboardStats } from "@/hooks/useDashboard"
import type { DashboardStats, InterviewType } from "@/types"
import { cn } from "@/lib/utils"

export function RecentInterviews() {
  const { data, isLoading } = useRecentSessions()
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSessions = (data ?? []).filter((s) => {
    const matchesType = filterType === "all" || s.config.type === filterType
    const matchesSearch = !searchQuery.trim() ||
      s.config.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.config.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <Card>
      <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <CardTitle>Recent interviews</CardTitle>
          <CardDescription>Review performance and feedback from previous sessions</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-1">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter bar */}
        {Boolean(data?.length) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All", value: "all" },
                { label: "Behavioral", value: "behavioral" },
                { label: "Technical", value: "technical" },
                { label: "System Design", value: "system-design" },
                { label: "Case Study", value: "case-study" },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterType(f.value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    filterType === f.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-44">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter role…"
                className="h-8 pl-8 text-xs bg-white/[0.02]"
              />
            </div>
          </div>
        )}

        {/* Sessions list */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          ) : !data?.length ? (
            <EmptyState
              icon={<Mic className="h-5 w-5" />}
              title="No interviews yet"
              description="Run your first mock interview to get tailored AI feedback and track progress."
              action={<Button size="sm" onClick={() => navigate("/interview/setup")}>Start an interview</Button>}
            />
          ) : filteredSessions.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">
              No sessions match your filter criteria.
            </p>
          ) : (
            filteredSessions.map((s, i) => {
              const isCompleted = s.status === "completed" || Boolean(s.completedAt)
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(isCompleted ? `/interview/feedback/${s.id}` : `/interview/live/${s.id}`)}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:border-white/15 hover:bg-white/[0.05] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold capitalize group-hover:text-primary transition-colors">
                        {s.config.type.replace("-", " ")} · {s.config.role}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{s.completedAt ? new Date(s.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "In progress"}</span>
                        <span>•</span>
                        <span className="capitalize">{s.config.durationMinutes ?? 30}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={isCompleted ? "secondary" : "outline"} className={cn("capitalize text-xs font-mono", !isCompleted && "border-amber-500/40 text-amber-400")}>
                      {isCompleted ? s.config.difficulty : "In Progress"}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AchievementsCard() {
  const { data, isLoading } = useAchievements()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> Milestones</CardTitle>
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
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center ${a.unlocked ? "glass border border-white/10" : "border border-dashed border-white/10 opacity-50"}`}
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
            <p className="text-sm font-semibold">Weekly Coach Insight</p>
          </div>
          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {!data || data.totalInterviews < 3
                ? "Complete at least 3 interviews to unlock personalized AI coaching insights calibrated to your pace."
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
    { label: "New Interview", desc: "Launch simulation", icon: Mic, to: "/interview/setup" },
    { label: "ATS Resume Scorer", desc: "Target job match", icon: Target, to: "/resume" },
    { label: "Resume Vault", desc: "Manage documents", icon: FileText, to: "/resume" },
    { label: "Prep Analytics", desc: "Review trends", icon: BarChart3, to: "/profile" },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={() => navigate(a.to)}
          className="group flex flex-col items-start gap-2.5 rounded-2xl glass p-4 text-left transition-all hover:bg-white/[0.06] hover:border-white/20 border border-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <a.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground block">{a.label}</span>
            <span className="text-[11px] text-muted-foreground block">{a.desc}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
