import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Sparkles, Globe, MessageCircle, Link2 } from "lucide-react"
import { ScrollReveal } from "@/components/shared/motion"

const faqs = [
  { q: "Is this a real conversation, or scripted questions?", a: "Every question — including follow-ups — is generated live by AI based on what you actually say, your resume, and your chosen interview settings. It's not a fixed script." },
  { q: "Do I need to upload a resume?", a: "Yes. Interviews are generated from your resume, so at least one valid resume needs to be uploaded before you can start — you then choose which resume each interview should be based on." },
  { q: "Is my voice recorded or uploaded anywhere?", a: "No. Speech-to-text runs entirely in your browser — nothing is recorded or sent to a server as audio. Only the resulting text answer is saved." },
  { q: "Which interview types are supported?", a: "Technical, Behavioral, System Design, and Case Study rounds, each with adjustable difficulty and duration." },
]

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button onClick={onClick} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={isOpen}>
        <span className="font-medium">{q}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium text-primary">Questions</p>
          <h2 className="text-4xl font-semibold sm:text-5xl">Good to know</h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="rounded-2xl glass px-6">
            {faqs.map((f, i) => (
              <FAQItem key={f.q} q={f.q} a={f.a} isOpen={open === i} onClick={() => setOpen(open === i ? null : i)} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <span className="font-display text-lg font-semibold">Aptitude</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">The AI interview coach that talks back — so the real one doesn't catch you off guard.</p>
            <div className="mt-5 flex gap-3">
              {[Globe, MessageCircle, Link2].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg glass text-muted-foreground transition-colors hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-10 text-sm">
            <div>
              <p className="mb-3 font-medium">Product</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium">Company</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium">Legal</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/[0.06] pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aptitude. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
