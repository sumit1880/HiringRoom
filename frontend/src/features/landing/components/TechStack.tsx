import {
  Atom,
  FileCode2,
  Server,
  Database,
  Palette,
  KeyRound,
  Mic,
} from "lucide-react"
import { ScrollReveal } from "@/components/shared/motion"

const stack = [
  { icon: Atom, label: "React" },
  { icon: FileCode2, label: "TypeScript" },
  { icon: Server, label: "Node.js & Express" },
  { icon: Database, label: "PostgreSQL & Prisma" },
  { icon: Palette, label: "Tailwind CSS" },
  { icon: KeyRound, label: "Google OAuth" },
  { icon: Mic, label: "Web Speech API" },
]

export function TechStack() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">Under the hood</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Built with modern technologies</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {stack.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-full glass px-5 py-2.5 text-sm text-foreground/85"
              >
                <s.icon className="h-4 w-4 text-primary" />
                {s.label}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
