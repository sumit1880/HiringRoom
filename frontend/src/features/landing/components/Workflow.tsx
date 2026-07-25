import { Upload, Settings2, Mic2, LineChart } from "lucide-react"
import { ScrollReveal } from "@/components/shared/motion"

const steps = [
  { icon: Upload, title: "Upload your resume", description: "We parse your experience so questions reference real projects, not generic prompts." },
  { icon: Settings2, title: "Choose the round", description: "Pick interview type, target role, difficulty, and how long you have." },
  { icon: Mic2, title: "Run the interview", description: "Speak naturally. The AI listens, follows up, and keeps time like a real interviewer." },
  { icon: LineChart, title: "Get your scorecard", description: "Category scores, strengths, gaps, and what to drill next — in under a minute." },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">The loop</p>
          <h2 className="text-4xl font-semibold sm:text-5xl">Four steps, every session</h2>
        </ScrollReveal>

        <div className="relative mt-20 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {steps.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.12} className="relative flex flex-col items-center text-center md:items-start md:text-left">
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-2xl glass-strong">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="mb-2 font-mono text-xs text-muted-foreground">Step {String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
