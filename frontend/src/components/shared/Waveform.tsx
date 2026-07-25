import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WaveformProps {
  active?: boolean
  barCount?: number
  className?: string
  color?: "primary" | "cyan"
}

/**
 * Animated bar waveform used for mic input / AI speech output.
 * When `active` is false, bars settle to a low, static baseline.
 */
export function Waveform({ active = true, barCount = 24, className, color = "primary" }: WaveformProps) {
  const bars = Array.from({ length: barCount })
  const gradient = color === "cyan" ? "bg-gradient-to-t from-[hsl(var(--cyan))] to-[hsl(var(--cyan))]/60" : "bg-gradient-to-t from-primary to-primary/60"

  return (
    <div className={cn("flex items-center justify-center gap-[3px] h-12", className)} role="img" aria-label="Audio waveform">
      {bars.map((_, i) => {
        const base = 0.2 + Math.abs(Math.sin(i * 0.8)) * 0.8
        return (
          <motion.span
            key={i}
            className={cn("w-[3px] rounded-full origin-center", gradient)}
            style={{ height: "100%" }}
            animate={
              active
                ? { scaleY: [base * 0.3, base, base * 0.4, base * 0.9, base * 0.3] }
                : { scaleY: 0.12 }
            }
            transition={
              active
                ? { duration: 0.9 + (i % 5) * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }
                : { duration: 0.3 }
            }
          />
        )
      })}
    </div>
  )
}
