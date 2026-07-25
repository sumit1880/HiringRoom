import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Brain, Users, Layers, PenLine, Check, FileText, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useResumes } from "@/hooks/useResume"
import { useCreateSession } from "@/hooks/useInterview"
import { cn } from "@/lib/utils"
import type { Difficulty, InterviewType } from "@/types"

const types: { value: InterviewType; label: string; icon: typeof Brain; desc: string }[] = [
  { value: "behavioral", label: "Behavioral", icon: Users, desc: "STAR-style stories, culture fit, conflict" },
  { value: "technical", label: "Technical", icon: Brain, desc: "Coding, debugging, technical depth" },
  { value: "system-design", label: "System design", icon: Layers, desc: "Architecture, scale, tradeoffs" },
  { value: "case-study", label: "Case study", icon: PenLine, desc: "Open-ended product or business problems" },
]

const difficulties: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "Warm-up, generous follow-ups" },
  { value: "medium", label: "Medium", desc: "Standard pace and pushback" },
  { value: "hard", label: "Hard", desc: "Aggressive follow-ups, tight time" },
]

const durations = [15, 30, 45, 60]

export function InterviewSetupPage() {
  const [type, setType] = useState<InterviewType>("behavioral")
  const [role, setRole] = useState("Frontend Engineer")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [duration, setDuration] = useState(30)
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>(undefined)
  const { data: resumes, isLoading: resumesLoading } = useResumes()
  const createSession = useCreateSession()
  const navigate = useNavigate()

  const readyResumes = (resumes ?? []).filter((r) => r.status === "ready")

  // Default to the most recently uploaded ready resume once the list loads,
  // without stomping on a choice the user already made.
  useEffect(() => {
    if (!selectedResumeId && readyResumes.length > 0) {
      setSelectedResumeId(readyResumes[0].id)
    }
  }, [readyResumes, selectedResumeId])

  const handleStart = () => {
    if (!selectedResumeId) return
    createSession.mutate(
      { type, role, difficulty, durationMinutes: duration, resumeId: selectedResumeId },
      { onSuccess: (session) => navigate(`/interview/live/${session.id}`) }
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Set up your interview</h1>
        <p className="mt-1 text-muted-foreground">Pick the format. You can change these every time.</p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Interview type</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {types.map((t) => (
            <motion.button
              key={t.value}
              onClick={() => setType(t.value)}
              whileTap={{ scale: 0.98 }}
              className="text-left"
            >
              <Card className={cn("relative transition-all duration-200", type === t.value && "gradient-border ring-1 ring-primary/40")}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", type === t.value ? "bg-primary/15 border-primary/30" : "glass border-white/10")}>
                    <t.icon className={cn("h-5 w-5", type === t.value ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="font-medium">{t.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  {type === t.value && (
                    <motion.div layoutId="type-check" className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <Label htmlFor="role" className="mb-4 block text-sm font-medium text-muted-foreground">Target role</Label>
          <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
        </div>

        <div>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Duration</h2>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "flex-1 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  duration === d ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
                )}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Difficulty</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {difficulties.map((d) => (
            <button key={d.value} onClick={() => setDifficulty(d.value)} className="text-left">
              <Card className={cn(difficulty === d.value && "gradient-border ring-1 ring-primary/40")}>
                <CardContent className="p-5">
                  <p className="font-medium capitalize">{d.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.desc}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Resume</h2>

        {resumesLoading ? (
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-10 w-10 animate-pulse rounded-xl glass" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
              </div>
            </CardContent>
          </Card>
        ) : readyResumes.length === 0 ? (
          <Card className="opacity-80">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No resume ready yet</p>
                <p className="text-xs text-muted-foreground">
                  Upload a resume from the Resume page — questions are generated from it, so one is required to start.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {readyResumes.map((r) => (
              <button key={r.id} onClick={() => setSelectedResumeId(r.id)} className="w-full text-left">
                <Card className={cn("transition-all duration-200", selectedResumeId === r.id && "gradient-border ring-1 ring-primary/40")}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", selectedResumeId === r.id ? "bg-primary/15 border-primary/30" : "glass border-white/10")}>
                      <FileText className={cn("h-5 w-5", selectedResumeId === r.id ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{r.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedResumeId === r.id && <Check className="h-4 w-4 text-primary" />}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end border-t border-white/[0.06] pt-8">
        <Button size="lg" onClick={handleStart} loading={createSession.isPending} disabled={!selectedResumeId}>
          Start interview
        </Button>
      </div>
    </div>
  )
}
