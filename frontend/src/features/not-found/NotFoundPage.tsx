import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Orb } from "@/components/shared/Orb"

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Orb state="idle" size={100} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-5xl font-semibold">404</h1>
        <p className="mt-2 text-muted-foreground">This page didn't make the cut.</p>
      </motion.div>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  )
}
