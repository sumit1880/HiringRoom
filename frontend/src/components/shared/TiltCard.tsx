import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export function TiltCard({
  children,
  className,
  intensity = 6,
}: {
  children: ReactNode
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(y, [0, 1], [intensity, -intensity]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensity, intensity]), { stiffness: 200, damping: 20 })
  const glowX = useTransform(x, [0, 1], ["0%", "100%"])
  const glowY = useTransform(y, [0, 1], ["0%", "100%"])

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((e.clientX - rect.left) / rect.width)
        y.set((e.clientY - rect.top) / rect.height)
      }}
      onMouseLeave={() => {
        x.set(0.5)
        y.set(0.5)
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, hsl(217 91% 60% / 0.15), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}
