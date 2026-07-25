import { Mic, Target, Clock, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/shared/States"
import { AnimatedCounter, ScrollReveal } from "@/components/shared/motion"
import { useDashboardStats } from "@/hooks/useDashboard"

const iconFor = { totalInterviews: Mic, averageScore: Target, hoursPracticed: Clock, currentStreak: Flame } as const

export function StatCards() {
  const { data, isLoading, isError } = useDashboardStats()

  const items = [
    { key: "totalInterviews", label: "Interviews completed", value: data?.totalInterviews ?? 0, suffix: "" },
    { key: "averageScore", label: "Average score", value: data?.averageScore ?? 0, suffix: "%" },
    { key: "hoursPracticed", label: "Hours practiced", value: data?.hoursPracticed ?? 0, suffix: "h", decimals: 1 },
    { key: "currentStreak", label: "Day streak", value: data?.currentStreak ?? 0, suffix: "" },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => {
        const Icon = iconFor[item.key]
        return (
          <ScrollReveal key={item.key} delay={i * 0.06}>
            <Card>
              <CardContent className="p-5">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="mt-4 h-7 w-16" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </>
                ) : isError ? (
                  <p className="text-xs text-destructive">Couldn't load</p>
                ) : (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-semibold">
                      <AnimatedCounter value={item.value} suffix={item.suffix} decimals={"decimals" in item ? item.decimals : 0} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        )
      })}
    </div>
  )
}
