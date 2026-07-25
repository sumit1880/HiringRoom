import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton, EmptyState } from "@/components/shared/States"
import { useScoreTrend } from "@/hooks/useDashboard"

export function ScoreTrendChart() {
  const { data, isLoading } = useScoreTrend()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score trend</CardTitle>
        <CardDescription>Your average interview score over the last 7 sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data?.length ? (
          <EmptyState
            icon={<TrendingUp className="h-5 w-5" />}
            title="No score data yet"
            description="Complete an interview and your score trend will show up here."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 96% / 0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "hsl(220 12% 62%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "hsl(220 12% 62%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(240 6% 10%)", border: "1px solid hsl(220 20% 96% / 0.1)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(220 20% 96%)" }}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#scoreGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
