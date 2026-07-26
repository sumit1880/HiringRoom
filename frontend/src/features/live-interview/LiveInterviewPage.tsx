import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Mic, MicOff, PhoneOff, Send, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Orb, type OrbState } from "@/components/shared/Orb"
import { Waveform } from "@/components/shared/Waveform"
import { AILoadingState } from "@/components/shared/AILoadingState"
import { useStartInterview, useSubmitAnswer } from "@/hooks/useInterview"
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

function useCountdown(startedAt: string | undefined, durationMinutes: number) {
  const [remaining, setRemaining] = useState(() => computeRemainingSeconds(startedAt, durationMinutes))

  useEffect(() => {
    setRemaining(computeRemainingSeconds(startedAt, durationMinutes))
    if (!startedAt) return
    const id = setInterval(() => {
      setRemaining(computeRemainingSeconds(startedAt, durationMinutes))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt, durationMinutes])

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")
  return { remaining, label: `${mm}:${ss}` }
}

export function LiveInterviewPage() {
  const { sessionId = "s_new" } = useParams()
  const navigate = useNavigate()
  const startInterview = useStartInterview()
  const submitAnswer = useSubmitAnswer(sessionId)

  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [startedAt, setStartedAt] = useState<string | undefined>(undefined)
  const isLoading = questions.length === 0

  useEffect(() => {
    if (!sessionId) return
    startInterview.mutate(sessionId, {
      onSuccess: (res) => {
        setQuestions((prev) => (prev.length === 0 ? [res.question] : prev))
        setDurationMinutes(res.durationMinutes)
        setStartedAt(res.startedAt)
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const [qIndex, setQIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [orbState, setOrbState] = useState<OrbState>("speaking")
  const [isEnding, setIsEnding] = useState(false)
  const { label: timeLabel } = useCountdown(startedAt, durationMinutes)
  

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

  useEffect(() => {
    setOrbState("speaking")
    const t = setTimeout(() => setOrbState("listening"), 1800)
    return () => clearTimeout(t)
  }, [qIndex])

  const handleSubmit = () => {
    if (!question) return
    if (isListening) stopListening()
    setOrbState("thinking")
    submitAnswer.mutate(
      { questionId: question.id, answer },
      {
        onSuccess: (res) => {
          setAnswer("")
          if (res.nextQuestion) {
            setQuestions((prev) => [...prev, res.nextQuestion as InterviewQuestion])
          }
          setTimeout(() => setQIndex((i) => Math.min(i + 1, questions.length)), 900)
        },
      }
    )
  }

  const handleEnd = () => {
    if (isListening) stopListening()
    setIsEnding(true)
    interviewService.completeSession(sessionId).finally(() => {
      navigate(`/interview/feedback/${sessionId}`)
    })
  }

  if (isLoading || !question) {
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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="font-mono">{timeLabel} remaining</Badge>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Question {question.index} of {question.total}
        </div>
      </div>
      <Progress value={(question.index / question.total) * 100} className="mt-3" />

      {/* Main stage */}
      <div className="relative mt-10 flex flex-1 flex-col items-center justify-center gap-8 rounded-3xl glass p-10">
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_20%,hsl(217_91%_60%/0.1),transparent_60%)]" />

        <Orb state={orbState} size={140} />

        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {orbState === "thinking" ? "Thinking" : orbState === "listening" ? "Listening" : "AI Interviewer"}
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={question.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-xl font-display text-xl leading-snug sm:text-2xl"
            >
              {question.prompt}
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
      </div>

      {/* Answer editor + controls */}
      <div className="mt-6 space-y-4">

        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Speak, or type your answer here as a backup…"
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
          />
          {isListening && (
            <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              {interimTranscript ? <span className="truncate italic">{interimTranscript}</span> : <span>Listening…</span>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleMic}
              disabled={!micSupported}
              aria-label={isListening ? "Stop recording" : "Start recording"}
              title={!micSupported ? "Speech recognition isn't supported in this browser" : isListening ? "Stop recording" : "Start recording"}
            >
              {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setQIndex((i) => Math.max(0, i - 1))} disabled={qIndex === 0} aria-label="Previous question">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setQIndex((i) => Math.min((questions?.length ?? 1) - 1, i + 1))} disabled={qIndex >= (questions?.length ?? 1) - 1} aria-label="Next question">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="destructive" onClick={handleEnd} loading={isEnding}>
              <PhoneOff className="h-4 w-4" /> End interview
            </Button>
            <Button onClick={handleSubmit} loading={submitAnswer.isPending} disabled={!answer.trim()}>
              <Send className="h-4 w-4" /> Submit answer
            </Button>
          </div>
        </div>

        {/* question navigator */}
        <div className="flex flex-wrap gap-2 pt-2">
          {questions?.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setQIndex(i)}
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
