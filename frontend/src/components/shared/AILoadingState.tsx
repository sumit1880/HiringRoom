import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Orb } from "./Orb"

/**
 * A premium, branded loading state for moments where the AI is doing real
 * work behind the scenes (generating the first question, scoring an
 * interview). Cycles through short status messages instead of leaving the
 * user looking at a blank screen or a generic spinner.
 */
export function AILoadingState({
  title,
  messages,
  className,
}: {
  title: string
  messages: string[]
  className?: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 1900)
    return () => clearInterval(id)
  }, [messages.length])

  return (
    <div className={`grid min-h-[60vh] place-items-center ${className ?? ""}`}>
      <div className="flex flex-col items-center gap-6 text-center">
        <Orb state="thinking" size={120} />

        <div>
          <p className="font-display text-lg font-semibold">{title}</p>
          <div className="mt-2 h-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-sm text-muted-foreground"
              >
                {messages[index]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}