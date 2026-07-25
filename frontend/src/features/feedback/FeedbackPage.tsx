import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  PartyPopper,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AILoadingState } from "@/components/shared/AILoadingState"
import { AnimatedCounter, ScrollReveal } from "@/components/shared/motion"
import { useFeedback } from "@/hooks/useFeedback"
import { cn } from "@/lib/utils"

function getScoreTier(score: number) {
  if (score >= 90) return { label: "Outstanding performance", className: "text-emerald-400" }
  if (score >= 80) return { label: "Strong session", className: "text-emerald-400" }
  if (score >= 65) return { label: "Solid effort", className: "text-primary" }
  if (score >= 50) return { label: "Good start — keep going", className: "text-amber-400" }
  return { label: "Room to grow — that's the point of practice", className: "text-amber-400" }
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle cx="80" cy="80" r="54" stroke="hsl(220 20% 96% / 0.08)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="80" cy="80" r="54" stroke="url(#scoreRingGradient)" strokeWidth="12" fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="scoreRingGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" />
            <stop offset="100%" stopColor="hsl(199 89% 58%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-semibold"><AnimatedCounter value={score} /></span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  )
}

function CategoryBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const qualifier = score >= 85 ? "Strong" : score >= 70 ? "Solid" : score >= 50 ? "Developing" : "Needs focus"

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <motion.span
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 4 }}
            transition={{ duration: 0.15 }}
            className="text-xs"
          >
            {qualifier}
          </motion.span>
          <span className="font-mono tabular-nums text-foreground">{score}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--cyan))]"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export function FeedbackPage() {
  const { sessionId = "s1" } = useParams()
  const { data, isLoading } = useFeedback(sessionId)
  const [celebrated, setCelebrated] = useState(false)
  const [noted, setNoted] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (data && !celebrated && data.overallScore >= 80) {
      setCelebrated(true)
    }
  }, [data, celebrated])

  const trendDelta = useMemo(() => {
    if (!data?.trend || data.trend.length < 2) return null
    return data.trend[data.trend.length - 1].score - data.trend[data.trend.length - 2].score
  }, [data])

  const toggleNoted = (i: number) => {
    setNoted((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (isLoading || !data) {
    return (
      <AILoadingState
        title="Generating your feedback"
        messages={[
          "Reviewing your answers…",
          "Scoring technical depth…",
          "Assessing communication…",
          "Compiling recommendations…",
        ]}
      />
    )
  }

  const tier = getScoreTier(data.overallScore)

  return (
    <div className="relative mx-auto max-w-4xl space-y-8">
      {celebrated && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2, delay: 1 }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute top-0 h-2 w-2 rounded-full"
              style={{ left: `${(i * 97) % 100}%`, background: i % 2 ? "hsl(217 91% 60%)" : "hsl(199 89% 58%)" }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ y: "100vh", opacity: 0, rotate: 360 }}
              transition={{ duration: 2.2 + (i % 5) * 0.2, delay: i * 0.03, ease: "easeIn" }}
            />
          ))}
        </motion.div>
      )}

      <ScrollReveal className="flex flex-col items-center gap-3 text-center">
        {data.overallScore >= 80 && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-400">
            <PartyPopper className="h-4 w-4" /> Strong session
          </div>
        )}
        <ScoreRing score={data.overallScore} />
        <div>
          <h1 className="text-2xl font-semibold">Here's how it went</h1>
          <p className={cn("mt-1 text-sm font-medium", tier.className)}>{tier.label}</p>
        </div>

        {trendDelta !== null && (
          <Badge variant="secondary" className="gap-1.5">
            {trendDelta > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : trendDelta < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {trendDelta > 0 ? `+${trendDelta}` : trendDelta} vs your last session
          </Badge>
        )}
      </ScrollReveal>

      <ScrollReveal>
        <Tabs defaultValue="overview">
          <TabsList className="mx-auto flex w-full max-w-md">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="growth" className="flex-1">Strengths & growth</TabsTrigger>
            <TabsTrigger value="next" className="flex-1">Next steps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category scores</CardTitle>
                <CardDescription>How you did across each dimension this session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {data.categories.map((c, i) => (
                  <CategoryBar key={c.label} label={c.label} score={c.score} delay={i * 0.1} />
                ))}
              </CardContent>
            </Card>

            {data.trend && data.trend.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Score history</CardTitle>
                  <CardDescription>How this compares to recent sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.trend} margin={{ left: -20 }}>
                      <XAxis dataKey="date" tick={{ fill: "hsl(220 12% 62%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[50, 100]} tick={{ fill: "hsl(220 12% 62%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(240 6% 10%)", border: "1px solid hsl(220 20% 96% / 0.1)", borderRadius: 12, fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="hsl(199 89% 58%)" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="growth">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-400"><ThumbsUp className="h-4 w-4" /> Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {data.strengths.map((s) => (
                      <motion.div key={s} variants={listItem} className="flex gap-2.5 rounded-lg p-2 -m-2 transition-colors hover:bg-white/[0.03]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <p className="text-sm text-muted-foreground">{s}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-400"><ThumbsDown className="h-4 w-4" /> Areas to improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
                    {data.weaknesses.map((s) => (
                      <motion.div key={s} variants={listItem} className="flex gap-2.5 rounded-lg p-2 -m-2 transition-colors hover:bg-white/[0.03]">
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <p className="text-sm text-muted-foreground">{s}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="next">
            <Card className="gradient-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Recommended next steps</CardTitle>
                  <span className="text-xs text-muted-foreground">{noted.size} of {data.recommendations.length} noted</span>
                </div>
                <CardDescription>Tap one off once you've taken it on board</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-1">
                  {data.recommendations.map((r, i) => {
                    const isNoted = noted.has(i)
                    return (
                      <motion.button
                        key={r}
                        variants={listItem}
                        onClick={() => toggleNoted(i)}
                        className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        {isNoted ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <p className={cn("text-sm transition-colors", isNoted ? "text-muted-foreground/50 line-through" : "text-foreground/85")}>
                          {r}
                        </p>
                      </motion.button>
                    )
                  })}
                </motion.div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollReveal>
    </div>
  )
}