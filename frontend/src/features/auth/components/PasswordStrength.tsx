import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function scorePassword(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"]
const colors = ["bg-destructive", "bg-orange-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-400"]

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score = scorePassword(password)

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className={cn("h-full origin-left rounded-full", colors[score])}
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{labels[score]}</p>
    </div>
  )
}
