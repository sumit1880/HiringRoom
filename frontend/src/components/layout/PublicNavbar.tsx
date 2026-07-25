import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "FAQ", href: "#faq" },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={cn("fixed top-0 z-50 w-full transition-all duration-300", scrolled ? "py-3" : "py-5")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 transition-all duration-300" style={scrolled ? { background: "hsl(240 6% 8% / 0.75)", backdropFilter: "blur(16px)", border: "1px solid hsl(220 20% 96% / 0.08)" } : {}}>
        <Link to="/" className="flex items-center gap-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="font-display text-lg font-semibold">Aptitude</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign in</Button>
          <Button size="sm" onClick={() => navigate("/register")}>Start free</Button>
        </div>

        <button className="p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl glass-strong p-4 md:hidden"
          >
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="py-1 text-sm text-muted-foreground" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate("/login")}>Sign in</Button>
                <Button size="sm" className="flex-1" onClick={() => navigate("/register")}>Start free</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
