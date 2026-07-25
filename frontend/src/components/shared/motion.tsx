import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion"
import { cn } from "@/lib/utils"

/** Fades + slides content into view once it enters the viewport. */
export function ScrollReveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Stagger container — wrap ScrollRevealItem children. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

/** Counts up to a target number once visible. */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { duration: 1.6, bounce: 0 })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (inView) {
      const controls = animate(motionVal, value, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplay(v.toFixed(decimals)),
      })
      return () => controls.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  void spring
  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/** Button wrapper that subtly follows the cursor within its bounds. */
export function MagneticWrap({ children, strength = 16, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength
        setPos({ x, y })
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

/** Page-level enter/exit wrapper used by the route transition layer. */
export function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
