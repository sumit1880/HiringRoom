import { motion } from "framer-motion"
import {
  LogIn,
  FileText,
  Brain,
  Layers,
  SlidersHorizontal,
  Clock,
  Mic,
  BarChart3,
  History,
  LayoutDashboard,
} from "lucide-react"
import { ScrollReveal } from "@/components/shared/motion"
import { TiltCard } from "@/components/shared/TiltCard"
import { Waveform } from "@/components/shared/Waveform"

const features = [
  {
    icon: LogIn,
    title: "Sign in with Google",
    description: "One-click sign-in — no passwords to create or remember.",
    span: "",
    visual: "none",
  },
  {
    icon: FileText,
    title: "Resume-aware questions",
    description: "Upload multiple resumes and choose which one powers each interview's questions.",
    span: "",
    visual: "none",
  },
  {
    icon: Brain,
    title: "AI-generated questions",
    description: "Every question — and every follow-up — is generated live by AI from your resume, role, and interview settings. Not a fixed script.",
    span: "",
    visual: "none",
  },
  {
    icon: Layers,
    title: "Four interview formats",
    description: "Technical, Behavioral, System Design, or Case Study — each with its own question style.",
    span: "",
    visual: "none",
  },
  {
    icon: SlidersHorizontal,
    title: "Adjustable difficulty",
    description: "Dial each session to Easy, Medium, or Hard to match where you're at.",
    span: "",
    visual: "none",
  },
  {
    icon: Clock,
    title: "Set your own duration",
    description: "Choose a 15, 30, 45, or 60-minute session — the timer tracks it live.",
    span: "",
    visual: "none",
  },
  {
    icon: Mic,
    title: "Speak your answers",
    description: "Built-in browser speech recognition converts what you say straight into your answer — no app to install, nothing uploaded.",
    span: "lg:col-span-2",
    visual: "voice",
  },
  {
    icon: BarChart3,
    title: "Scored, structured feedback",
    description: "Each answer is evaluated for technical depth, communication, and confidence, with concrete strengths and gaps.",
    span: "lg:col-span-2",
    visual: "adaptive",
  },
  {
    icon: History,
    title: "Full interview history",
    description: "Every past session is saved so you can revisit questions, answers, and feedback anytime.",
    span: "",
    visual: "none",
  },
  {
    icon: LayoutDashboard,
    title: "Progress dashboard",
    description: "Track your average score, practice streak, and trend over time in one place.",
    span: "",
    visual: "none",
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">What's inside</p>
          <h2 className="text-4xl font-semibold sm:text-5xl">Everything the product actually does</h2>
          <p className="mt-4 text-muted-foreground">
            No filler. Just the capabilities you'll use every time you practice.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.06} className={f.span}>
              <TiltCard className="group h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl glass p-6 transition-colors duration-300 hover:bg-white/[0.05]">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>

                  {f.visual === "voice" && (
                    <div className="mt-5 rounded-xl bg-black/20 p-3">
                      <Waveform barCount={16} />
                    </div>
                  )}
                  {f.visual === "adaptive" && (
                    <div className="mt-5 flex items-end gap-1.5">
                      {[60, 80, 45, 90, 70].map((h, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                          style={{ height: `${h}px`, originY: 1 }}
                          className="w-4 flex-1 rounded-t-md bg-gradient-to-t from-primary/50 to-primary"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
