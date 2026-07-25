import { useLocation, useOutlet } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { PageFade } from "@/components/shared/motion"

/**
 * Wraps the current route's element in an animated fade/slide so every
 * navigation feels like a deliberate transition rather than an instant swap.
 */
export function AnimatedOutlet() {
  const location = useLocation()
  const element = useOutlet()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageFade key={location.pathname}>{element}</PageFade>
    </AnimatePresence>
  )
}
