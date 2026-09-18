import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Mic, MicOff, PhoneOff, Send, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Orb, type OrbState } from "@/components/shared/Orb"
import { Waveform } from "@/components/shared/Waveform"
import { AILoadingState } from "@/components/shared/AILoadingState"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { interviewService } from "@/services/interviewService"
import { cn } from "@/lib/utils"
import type { InterviewQuestion } from "@/types"

// Computes remaining seconds from the session's real startedAt + duration
// (both come from the backend) rather than counting down from a fixed
// value in memory — so a page refresh recovers the true remaining time
// instead of resetting the clock.
function computeRemainingSeconds(startedAt: string | undefined, durationMinutes: number): number {
  if (!startedAt) return durationMinutes * 60
  const elapsedSeconds = (Date.now() - new Date(startedAt).getTime()) / 1000
  return Math.max(0, Math.round(durationMinutes * 60 - elapsedSeconds))
}

function useCountdown(startedAt: string | undefined, durationMinutes: number, isPaused: boolean) {
  const [remaining, setRemaining] = useState(() => computeRemainingSeconds(startedAt, durationMinutes))

  useEffect(() => {
    setRemaining(computeRemainingSeconds(startedAt, durationMinutes))
    if (!startedAt || isPaused) return
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, durationMinutes, isPaused])

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")
  return { remaining, label: `${mm}:${ss}` }
}

export function LiveInterviewPage() {
  const { sessionId = "s_new" } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [startedAt, setStartedAt] = useState<string | undefined>(undefined)
  const [isPaused, setIsPaused] = useState(false)

  // Text of the question currently being streamed in, shown live before
  // it's added to `questions` once the stream completes — this is what
  // gives the "typing in" effect on both the opening question and every
  // follow-up question.
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const isLoading = questions.length === 0 && !streamingText

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setStreamingText("")
    interviewService
      .startInterviewStream(sessionId, (partial) => {
        if (!cancelled) setStreamingText(partial)
      })
      .then((res) => {
        if (cancelled) return
        setQuestions((prev) => (prev.length === 0 ? [res.question] : prev))
        setDurationMinutes(res.durationMinutes)
        setStartedAt(res.startedAt)
      })
      .catch((err) => {
        if (!cancelled) toast.error(err?.message ?? "Failed to start the interview.")
      })
      .finally(() => {
        if (!cancelled) {
          setStreamingText(null)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [orbState, setOrbState] = useState<OrbState>("speaking")
  const [isEnding, setIsEnding] = useState(false)
  const { label: timeLabel } = useCountdown(startedAt, durationMinutes, isPaused)

  const appendTranscript = (text: string) => {
    setAnswer((prev) => (prev ? `${prev.trim()} ${text}` : text))
  }

  const {
    isSupported: micSupported,
    isListening,
    interimTranscript,
    error: micError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition(appendTranscript)

  useEffect(() => {
    if (micError) toast.error(micError)
  }, [micError])

  const toggleMic = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const question = questions?.[qIndex]
  const [isSubmitting, setIsSubmitting] = useState(false)

  // While a new question is streaming in (either the opening question, or
  // the next one after submitting an answer), show its text live instead
  // of the last fully-loaded question.
  const displayedPrompt = streamingText !== null ? streamingText : question?.prompt

  useEffect(() => {
    setOrbState("speaking")
    const t = setTimeout(() => setOrbState("listening"), 1800)
    return () => clearTimeout(t)
  }, [qIndex])

  const handleSubmit = () => {
    if (!question || !answer.trim() || isSubmitting) return
    if (isListening) stopListening()
    setOrbState("thinking")
    setIsSubmitting(true)
    interviewService
      .submitAnswerStream(sessionId, question.id, answer, (partial) => {
        setStreamingText(partial)
      })
      .then((res) => {
        setAnswer("")
        if (res.nextQuestion) {
          setQuestions((prev) => [...prev, res.nextQuestion as InterviewQuestion])
        }
        setTimeout(() => setQIndex((i) => Math.min(i + 1, questions.length)), 300)
      })
      .catch((err) => {
        toast.error(err?.message ?? "Failed to submit your answer.")
      })
      .finally(() => {
        setIsSubmitting(false)
        setStreamingText(null)
      })
  }

  const handleSubmitRef = useRef(handleSubmit)
  handleSubmitRef.current = handleSubmit
  const toggleMicRef = useRef(toggleMic)
  toggleMicRef.current = toggleMic

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        handleSubmitRef.current()
      }
      if (e.altKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault()
        toggleMicRef.current()
      }
      if (e.key === "Escape") {
        setIsPaused((p) => !p)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleEnd = () => {
    if (isListening) stopListening()
    setIsEnding(true)
    interviewService.completeSession(sessionId).finally(() => {
      navigate(`/interview/feedback/${sessionId}`)
    })
  }


  if (isLoading) {
    return (
      <AILoadingState
        title="Preparing your interview"
        messages={[
          "Analyzing your resume…",
          "Reviewing the interview format…",
          "Calibrating question difficulty…",
          "Almost ready…",
        ]}
      />
    )
  }

  // While a question is streaming in and hasn't been added to `questions`
  // yet (either the very first one, or the next one after an answer),
  // fall back to a lightweight placeholder so index/total/id are always
  // defined for the render below.
  const displayedQuestion = question ?? {
    id: "streaming",
    index: questions.length + 1,
    total: questions.length + 1,
    prompt: "",
  }

  const answerWordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isPaused ? "outline" : "secondary"} className={cn("font-mono text-xs", isPaused && "border-amber-500/50 text-amber-400")}>
            {isPaused ? "Paused" : `${timeLabel} remaining`}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused((p) => !p)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title={isPaused ? "Resume interview (Esc)" : "Pause interview (Esc)"}
          >
            {isPaused ? <Play className="mr-1.5 h-3.5 w-3.5" /> : <Pause className="mr-1.5 h-3.5 w-3.5" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Question {displayedQuestion.index} of {displayedQuestion.total}
        </div>
      </div>
      <Progress value={(displayedQuestion.index / displayedQuestion.total) * 100} className="mt-3" />

      {/* Main stage */}
      <div className="relative mt-10 flex flex-1 flex-col items-center justify-center gap-8 rounded-3xl glass p-10 overflow-hidden">
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_20%,hsl(217_91%_60%/0.1),transparent_60%)]" />

        <Orb state={orbState} size={140} />

        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {orbState === "thinking" ? "Thinking" : orbState === "listening" ? "Listening" : "AI Interviewer"}
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={question?.id ?? "streaming"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-xl font-display text-xl leading-snug sm:text-2xl"
            >
              {displayedPrompt}
              {streamingText !== null && (
                <span className="inline-block w-1.5 h-5 ml-1 bg-primary align-middle animate-pulse" />
              )}
            </motion.p>
          </AnimatePresence>
        </div>

        <Waveform active={orbState === "listening" || orbState === "speaking" || isListening} barCount={28} className="relative z-10 w-full max-w-md" />

        {orbState === "thinking" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </span>
            Evaluating your answer
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-background/85 backdrop-blur-md p-6 text-center animate-in fade-in duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
              <Pause className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Interview Paused</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Take a breath and gather your thoughts. Your timer is on hold.
            </p>
            <Button
              onClick={() => setIsPaused(false)}
              className="mt-6 gap-2"
            >
              <Play className="h-4 w-4" /> Resume Interview
            </Button>
            <span className="mt-3 text-[11px] text-muted-foreground">
              or press <kbd className="rounded border border-white/15 px-1 py-0.5 font-mono text-[10px]">Esc</kbd>
            </span>
          </div>
        )}
      </div>

      {/* Answer editor + controls */}
      <div className="mt-6 space-y-4">
        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Speak, or type your answer here as a backup… (⌘+Enter to submit)"
            rows={3}
            disabled={isPaused}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 pb-8 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground disabled:opacity-50"
          />
          <div className="pointer-events-none absolute right-4 bottom-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            {isListening && (
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {interimTranscript ? <span className="max-w-[200px] truncate italic">{interimTranscript}</span> : <span>Listening…</span>}
              </span>
            )}
            <span>{answerWordCount} {answerWordCount === 1 ? "word" : "words"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleMic}
              disabled={!micSupported || isPaused}
              aria-label={isListening ? "Stop recording (Alt+M)" : "Start recording (Alt+M)"}
              title={!micSupported ? "Speech recognition isn't supported in this browser" : isListening ? "Stop recording (Alt+M)" : "Start recording (Alt+M)"}
            >
              {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setQIndex((i) => Math.max(0, i - 1))} disabled={qIndex === 0 || isPaused} aria-label="Previous question">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setQIndex((i) => Math.min((questions?.length ?? 1) - 1, i + 1))} disabled={qIndex >= (questions?.length ?? 1) - 1 || isPaused} aria-label="Next question">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="hidden sm:inline text-[11px] text-muted-foreground/60 ml-1">
              Alt+M mic • Esc pause
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="destructive" onClick={handleEnd} loading={isEnding} disabled={isSubmitting}>
              <PhoneOff className="h-4 w-4 mr-1" /> End interview
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting} disabled={!answer.trim() || isPaused}>
              <Send className="h-4 w-4 mr-1" /> Submit answer
              <span className="hidden sm:inline ml-1.5 font-mono text-[10px] opacity-70">⌘↵</span>
            </Button>
          </div>
        </div>

        {/* question navigator */}
        <div className="flex flex-wrap gap-2 pt-2">
          {questions?.map((q, i) => (
            <button
              key={q.id}
              onClick={() => !isPaused && setQIndex(i)}
              className={cn(
                "h-2 flex-1 min-w-8 rounded-full transition-colors",
                i === qIndex ? "bg-primary" : i < qIndex ? "bg-primary/40" : "bg-white/10"
              )}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
