import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { StatCards } from "./components/StatCards"
import { ScoreTrendChart } from "./components/ScoreTrendChart"
import { RecentInterviews, AchievementsCard, AIInsights, QuickActions } from "./components/DashboardWidgets"

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export function DashboardPage() {
  const { user } = useAuth()
  const firstName = (user?.name ?? "Alex").split(" ")[0]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold">{getGreeting()}, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">Here's how your prep is trending.</p>
      </motion.div>

      <StatCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ScoreTrendChart />
          <RecentInterviews />
        </div>
        <div className="space-y-6">
          <AIInsights />
          <QuickActions />
          <AchievementsCard />
        </div>
      </div>
    </div>
  )
}
