import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Brain, Users, Layers, PenLine, Check, FileText, AlertCircle, Sparkles, UploadCloud, Clock, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useResumes } from "@/hooks/useResume"
import { useCreateSession } from "@/hooks/useInterview"
import { cn } from "@/lib/utils"
import type { Difficulty, InterviewType } from "@/types"

const rolePresets = [
  "Full Stack Engineer",
  "Frontend Engineer",
  "Backend Systems Engineer",
  "Machine Learning Engineer",
  "DevOps / Cloud Architect",
  "Product Manager",
]

const types: {
  value: InterviewType
  label: string
  icon: typeof Brain
  desc: string
  tag: string
  badgeColor: string
}[] = [
  {
    value: "behavioral",
    label: "Behavioral",
    icon: Users,
    desc: "STAR-style stories, culture fit, conflict resolution, leadership principles",
    tag: "STAR Method",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: "technical",
    label: "Technical",
    icon: Brain,
    desc: "Coding depth, debugging, algorithms, time/space complexity, data structures",
    tag: "DSA & Depth",
    badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
  {
    value: "system-design",
    label: "System Design",
    icon: Layers,
    desc: "Distributed systems, high scalability, database choices, caching & tradeoffs",
    tag: "Architecture",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    value: "case-study",
    label: "Case Study",
    icon: PenLine,
    desc: "Open-ended product strategy, business metrics, estimation, and problem solving",
    tag: "Strategy",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
]

const difficulties: {
  value: Difficulty
  label: string
  desc: string
  badgeColor: string
}[] = [
  {
    value: "easy",
    label: "Easy",
    desc: "Warm-up pace, foundational concepts, friendly hints & guidance",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Standard industry bar, realistic pressure, tradeoff probes",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    value: "hard",
    label: "Hard",
    desc: "Senior / Staff level depth, aggressive follow-ups, edge cases",
    badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
]

const durations = [15, 30, 45, 60]

export function InterviewSetupPage() {
  const [type, setType] = useState<InterviewType>("behavioral")
  const [role, setRole] = useState("Frontend Engineer")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [duration, setDuration] = useState(30)
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>(undefined)
  const [jobDescription, setJobDescription] = useState("")
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
      {
        type,
        role,
        difficulty,
        durationMinutes: duration,
        resumeId: selectedResumeId,
        jobDescription: jobDescription.trim() || undefined,
      },
      { onSuccess: (session) => navigate(`/interview/live/${session.id}`) }
    )
  }

  const selectedResume = readyResumes.find((r) => r.id === selectedResumeId)

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Set up your interview</h1>
        <p className="mt-1 text-muted-foreground">
          Calibrate your simulation format, role focus, and background material before beginning.
        </p>
      </div>

      {/* 1. Interview Type */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            1. Interview Format
          </h2>
          <span className="text-xs text-muted-foreground">Choose the primary evaluation focus</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {types.map((t) => (
            <motion.button
              key={t.value}
              onClick={() => setType(t.value)}
              whileTap={{ scale: 0.98 }}
              className="text-left"
            >
              <Card className={cn("relative transition-all duration-200 hover:border-white/20", type === t.value && "gradient-border ring-1 ring-primary/40 bg-white/[0.04]")}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border", type === t.value ? "bg-primary/15 border-primary/30" : "glass border-white/10")}>
                    <t.icon className={cn("h-5 w-5", type === t.value ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{t.label}</p>
                      <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", t.badgeColor)}>
                        {t.tag}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
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

      {/* 2. Target Role & Presets */}
      <section className="space-y-4">
        <div>
          <Label htmlFor="role" className="mb-2 block text-sm font-medium uppercase tracking-wider text-muted-foreground">
            2. Target Role & Seniority
          </Label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="h-11 bg-white/[0.03]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground/70 mr-1">Presets:</span>
          {rolePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setRole(preset)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                role === preset
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Duration & Difficulty */}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Duration
            </h2>
            <span className="text-xs text-muted-foreground">{duration} minutes session</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {durations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={cn(
                  "rounded-xl py-3 text-sm font-medium transition-all text-center",
                  duration === d
                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                    : "glass text-muted-foreground hover:text-foreground border border-white/10"
                )}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Difficulty Tier
            </h2>
            <span className="capitalize text-xs text-muted-foreground font-mono">{difficulty}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={cn(
                  "rounded-xl p-3 text-left transition-all border",
                  difficulty === d.value
                    ? cn("ring-1 ring-primary/40 bg-white/[0.05]", d.badgeColor)
                    : "glass border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <p className="font-semibold text-xs capitalize">{d.label}</p>
                <p className="mt-1 text-[11px] leading-snug line-clamp-2 opacity-80">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Target Job Description */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="jd" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            3. Job Description <span className="font-normal lowercase text-muted-foreground/60">(optional)</span>
          </Label>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {jobDescription && (
              <button
                type="button"
                onClick={() => setJobDescription("")}
                className="flex items-center gap-1 text-muted-foreground hover:text-rose-400 transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
            <span className="font-mono">{jobDescription.length} / 8,000 chars</span>
          </div>
        </div>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the target job description or requirements here to anchor questions to specific technologies, responsibilities, and team expectations…"
          rows={4}
          maxLength={8000}
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
        />
        <p className="text-[11px] text-muted-foreground/70">
          When provided, the AI interviewer will cross-reference this description with your resume to challenge you on relevant gaps and core requirements.
        </p>
      </section>

      {/* 5. Resume Selection */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            4. Selected Resume Context
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/resume")}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <UploadCloud className="h-3.5 w-3.5" /> Manage Resumes
          </Button>
        </div>

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
          <Card className="border-dashed border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-center justify-between p-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-amber-300 text-sm">No analyzed resume found</p>
                  <p className="text-xs text-muted-foreground">
                    Upload your resume to enable personalized RAG questions grounded in your actual work experience.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("/resume")} className="shrink-0 gap-1.5">
                <UploadCloud className="h-4 w-4" /> Upload Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {readyResumes.map((r) => (
              <button key={r.id} onClick={() => setSelectedResumeId(r.id)} className="w-full text-left">
                <Card className={cn("transition-all duration-200 hover:border-white/20", selectedResumeId === r.id && "gradient-border ring-1 ring-primary/40 bg-white/[0.04]")}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", selectedResumeId === r.id ? "bg-primary/15 border-primary/30" : "glass border-white/10")}>
                      <FileText className={cn("h-5 w-5", selectedResumeId === r.id ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{r.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Ready for RAG • Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedResumeId === r.id && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-mono">
                        Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] pt-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Configuration:</span>
          <Badge variant="outline" className="capitalize">{type.replace("-", " ")}</Badge>
          <Badge variant="outline" className="capitalize">{difficulty}</Badge>
          <Badge variant="outline">{duration}m</Badge>
          {selectedResume && (
            <Badge variant="secondary" className="max-w-[180px] truncate">
              {selectedResume.fileName}
            </Badge>
          )}
        </div>

        <Button
          size="lg"
          onClick={handleStart}
          loading={createSession.isPending}
          disabled={!selectedResumeId}
          className="gap-2 w-full sm:w-auto"
        >
          <Sparkles className="h-4 w-4" /> Start Interview
        </Button>
      </div>
    </div>
  )
}
