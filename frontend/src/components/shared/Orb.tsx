import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type OrbState = "idle" | "listening" | "thinking" | "speaking"

interface OrbProps {
  state?: OrbState
  size?: number
  className?: string
}

/**
 * The signature AI presence. A restrained, single-hue sphere whose motion
 * communicates state: idle (slow breathing), listening (steady pulse),
 * thinking (rotating inner glow), speaking (rapid pulse synced conceptually
 * to audio output). Uses only the app's blue accent — no rainbow gradients.
 */
export function Orb({ state = "idle", size = 96, className }: OrbProps) {
  const speed = state === "thinking" ? 1.4 : state === "speaking" ? 0.8 : state === "listening" ? 1.6 : 3.2

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {/* outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.28), transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[10%] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--cyan) / 0.22), transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: speed * 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      {/* core */}
      <motion.div
        className="absolute inset-[22%] rounded-full shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
        style={{
          background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--cyan)), hsl(var(--primary)))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6 / speed, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[30%] rounded-full bg-background/50 backdrop-blur-sm" />
      {state === "thinking" && (
        <motion.div
          className="absolute inset-[38%] rounded-full bg-white/80"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>
  )
}
