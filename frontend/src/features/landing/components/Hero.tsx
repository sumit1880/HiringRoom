import { motion } from "framer-motion"
import { ArrowRight, Mic } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Orb } from "@/components/shared/Orb"
import { Waveform } from "@/components/shared/Waveform"
import { MagneticWrap } from "@/components/shared/motion"

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="default" className="mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              AI-powered mock interviews
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Rehearse the interview
            <br />
            <span className="text-gradient">before it happens.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-lg text-lg text-muted-foreground"
          >
            Upload your resume, pick a format and difficulty, and talk through an AI-generated
            interview — Technical, Behavioral, System Design, or Case Study — then get scored,
            structured feedback when you're done.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticWrap>
              <Button size="lg" onClick={() => navigate("/register")}>
                Start your first mock interview
                <ArrowRight className="h-4 w-4" />
              </Button>
            </MagneticWrap>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto flex h-[420px] w-full max-w-sm items-center justify-center"
        >
          <div className="gradient-border glass-strong relative flex h-full w-full flex-col items-center justify-center gap-6 rounded-[2rem] p-8">
            <Orb state="listening" size={140} />
            <Waveform barCount={20} className="w-full" />
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Listening</p>
              <p className="mt-2 text-sm text-foreground/80">"Tell me about a time you disagreed with a design decision..."</p>
            </div>
            <motion.div
              className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-2xl glass-strong px-4 py-3 shadow-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mic className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Speech-to-text, right in your browser</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}