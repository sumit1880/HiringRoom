import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Target,
  History,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EmptyState, Skeleton } from "@/components/shared/States"
import {
  useResume,
  useResumes,
  useUploadResume,
  useDeleteResume,
  useScoreResumeATS,
  useRetryResume,
} from "@/hooks/useResume"
import { cn } from "@/lib/utils"

const steps = [
  "Uploading file",
  "Extracting PDF text",
  "Validating resume content",
  "Generating pgvector embeddings",
  "Ready for mock interviews"
]

export function ResumePage() {
  const { data: resume, isLoading } = useResume()
  const { data: allResumes = [] } = useResumes()
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  
  // Targeted ATS scoring state
  const [showJdInput, setShowJdInput] = useState(false)
  const [targetJd, setTargetJd] = useState("")
  const [copiedSummary, setCopiedSummary] = useState(false)

  const upload = useUploadResume((pct) => {
    setProgress(pct)
    setStepIndex(pct < 100 ? 0 : 1)
  })
  const deleteResume = useDeleteResume()
  const scoreATS = useScoreResumeATS()
  const retryResume = useRetryResume()

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return
      setPendingFile(file)
      setProgress(0)
      setStepIndex(0)
      upload.mutate(file, {
        onSuccess: () => {
          setStepIndex(4)
          setTimeout(() => setPendingFile(null), 1200)
        },
        onError: () => setStepIndex(-1),
      })
    },
    [upload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleCopySummary = () => {
    if (!scoreATS.data) return
    const text = `ATS Score: ${scoreATS.data.score}/100\n\nSummary:\n${scoreATS.data.summary}\n\nKey Strengths:\n${scoreATS.data.strengths.map((s) => `• ${s}`).join("\n")}\n\nTarget Improvements:\n${scoreATS.data.improvements.map((i) => `• ${i}`).join("\n")}`
    navigator.clipboard.writeText(text)
    setCopiedSummary(true)
    toast.success("ATS summary copied to clipboard")
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Resume Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and diagnose your resume. RAG retrieval automatically grounds mock interview questions in your real background.
        </p>
      </div>

      {/* Upload Dropzone */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200",
              isDragActive
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border/70 hover:border-primary/40 hover:bg-muted/20"
            )}
          >
            <input {...getInputProps()} aria-label="Upload resume" />
            <motion.div
              animate={{ y: isDragActive ? -4 : 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary"
            >
              <UploadCloud className="h-6 w-6" />
            </motion.div>
            <div>
              <p className="font-medium text-foreground">
                {isDragActive ? "Release to upload" : "Click to select or drag & drop your resume"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                PDF documents up to 10MB • Automatically parsed and indexed with pgvector
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress Animation */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/30 bg-primary/[0.02]">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{pendingFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {steps[Math.max(stepIndex, 0)]}…
                    </p>
                  </div>
                  {stepIndex === 4 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : stepIndex === -1 ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
                <Progress value={stepIndex === 4 ? 100 : Math.max(progress, 20)} className="h-1.5" />
                <div className="flex justify-between">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px]",
                        i <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground/60"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          i <= stepIndex ? "bg-primary" : "bg-border"
                        )}
                      />
                      <span className="hidden sm:inline">{s}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Active Resume & ATS Diagnostic */}
      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ) : resume ? (
        <Card className="border-border/70 shadow-sm overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  {resume.fileName}
                  {resume.status === "ready" ? (
                    <Badge variant="success" className="text-[11px] font-medium">Ready for RAG</Badge>
                  ) : resume.status === "parsing" || resume.status === "uploading" ? (
                    <Badge variant="secondary" className="text-[11px] flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" /> Processing
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[11px]">Processing Error</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Active resume • Uploaded {new Date(resume.uploadedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {resume.status === "error" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  disabled={retryResume.isPending}
                  onClick={() => retryResume.mutate(resume.id)}
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", retryResume.isPending && "animate-spin")} />
                  Retry Processing
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Remove resume"
                disabled={deleteResume.isPending}
                onClick={() => deleteResume.mutate(resume.id)}
              >
                {deleteResume.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {resume.status === "error" && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-destructive">Embeddings generation failed</p>
                  <p className="text-muted-foreground">
                    The background worker was unable to complete pgvector embeddings for this resume. Click "Retry Processing" above to re-enqueue.
                  </p>
                </div>
              </div>
            )}

            {/* ATS Scoring Section */}
            <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    ATS Diagnostic & Keyword Match
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Evaluates formatting, ATS parseability, and keyword coverage.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 self-start sm:self-auto"
                  onClick={() => setShowJdInput(!showJdInput)}
                >
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  {showJdInput ? "Hide Job Description" : "Target Specific Job"}
                  {showJdInput ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>

              {/* Collapsible Target JD Input */}
              <AnimatePresence>
                {showJdInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2 pt-1"
                  >
                    <label className="text-xs font-medium text-muted-foreground">
                      Paste Target Job Description (Optional)
                    </label>
                    <textarea
                      value={targetJd}
                      onChange={(e) => setTargetJd(e.target.value)}
                      placeholder="Paste the job requirements, responsibilities, or tech stack here to score alignment..."
                      className="w-full h-24 rounded-lg border border-border bg-background/50 p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button if not scored */}
              {!scoreATS.data && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => scoreATS.mutate({ id: resume.id, jobDescription: targetJd })}
                  disabled={scoreATS.isPending || resume.status !== "ready"}
                >
                  {scoreATS.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {scoreATS.isPending ? "Analyzing with AI..." : targetJd.trim() ? "Score Against Target Job" : "Run ATS Diagnostic"}
                </Button>
              )}

              {/* ATS Results View */}
              {scoreATS.data && (
                <div className="space-y-4 pt-2 border-t border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center font-display text-xl font-bold border",
                        scoreATS.data.score >= 80 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        scoreATS.data.score >= 60 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        "bg-destructive/10 border-destructive/30 text-destructive"
                      )}>
                        {scoreATS.data.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {scoreATS.data.score >= 80 ? "High ATS Fit" :
                             scoreATS.data.score >= 60 ? "Moderate Alignment" : "Needs Optimization"}
                          </span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{scoreATS.data.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={handleCopySummary}
                      >
                        {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedSummary ? "Copied" : "Copy Summary"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => scoreATS.mutate({ id: resume.id, jobDescription: targetJd })}
                        disabled={scoreATS.isPending}
                      >
                        <RefreshCw className={cn("h-3 w-3", scoreATS.isPending && "animate-spin")} />
                        Re-evaluate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {scoreATS.data.strengths.length > 0 && (
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] p-3 space-y-1.5">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                        </span>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {scoreATS.data.strengths.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400/60">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scoreATS.data.improvements.length > 0 && (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.02] p-3 space-y-1.5">
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" /> Key Improvements
                        </span>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {scoreATS.data.improvements.map((imp, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400/60">•</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {scoreATS.data.missingKeywords.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Recommended Keywords to Include:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scoreATS.data.missingKeywords.map((k) => (
                          <Badge
                            key={k}
                            variant="secondary"
                            className="text-[11px] font-normal border-primary/20 bg-primary/5 text-primary"
                          >
                            + {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        !pendingFile && (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No resume uploaded yet"
            description="Upload your resume in PDF format to enable personalized, experience-targeted interview questions."
          />
        )
      )}

      {/* Resume Version History Section */}
      {allResumes.length > 1 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History className="h-4 w-4 text-primary" />
            Resume Version History ({allResumes.length})
          </div>

          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card/40 overflow-hidden">
            {allResumes.map((r, idx) => (
              <div key={r.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate flex items-center gap-2">
                      {r.fileName}
                      {idx === 0 && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">Active</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === "ready" ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                      Ready
                    </Badge>
                  ) : r.status === "error" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1 text-destructive border-destructive/30"
                      onClick={() => retryResume.mutate(r.id)}
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Processing…
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteResume.mutate(r.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

