import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Orb } from "@/components/shared/Orb"

export function AuthLayout({
  title,
  subtitle,
  children,
  quote = "An AI interviewer that adapts its follow-up questions to your resume and your answers.",
  quoteAuthor = "How TheHiringRoom interviews work",
}: {
  title: string
  subtitle: string
  children: ReactNode
  quote?: string
  quoteAuthor?: string
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Aptitude</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm"
        >
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>

      {/* Right: showcase */}
      <div className="relative hidden w-1/2 items-center justify-center border-l border-border bg-card/40 lg:flex">
        <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-2xl border border-border bg-card p-12">
          <Orb state="idle" size={120} />
          <blockquote className="text-center">
            <p className="font-display text-xl leading-snug">{quote}</p>
            <footer className="mt-4 text-sm text-muted-foreground">{quoteAuthor}</footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
