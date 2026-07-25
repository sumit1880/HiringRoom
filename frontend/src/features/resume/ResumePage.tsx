import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EmptyState, Skeleton } from "@/components/shared/States"
import { useResume, useUploadResume, useDeleteResume } from "@/hooks/useResume"
import { cn } from "@/lib/utils"

const steps = ["Uploading", "Parsing", "Extracting skills", "Ready"]

export function ResumePage() {
  const { data: resume, isLoading } = useResume()
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const upload = useUploadResume((pct) => {
    setProgress(pct)
    setStepIndex(pct < 100 ? 0 : 1)
  })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const deleteResume = useDeleteResume()

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return
      setPendingFile(file)
      setProgress(0)
      setStepIndex(0)
      upload.mutate(file, {
        onSuccess: () => {
          setStepIndex(3)
          setTimeout(() => setPendingFile(null), 1200)
        },
        onError: () => setStepIndex(-1),
      })
    },
    [upload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Resume</h1>
        <p className="mt-1 text-muted-foreground">Upload your resume so interview questions reference your real experience.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20"
            )}
          >
            <input {...getInputProps()} aria-label="Upload resume" />
            <motion.div animate={{ y: isDragActive ? -4 : 0 }} className="flex h-14 w-14 items-center justify-center rounded-2xl glass">
              <UploadCloud className="h-6 w-6 text-primary" />
            </motion.div>
            <p className="font-medium">{isDragActive ? "Drop it here" : "Drag & drop your resume"}</p>
            <p className="text-sm text-muted-foreground">or click to browse — PDF or Word, up to 10MB</p>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {pendingFile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{pendingFile.name}</p>
                    <p className="text-xs text-muted-foreground">{steps[Math.max(stepIndex, 0)]}…</p>
                  </div>
                  {stepIndex === 3 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : stepIndex === -1 ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
                <Progress value={stepIndex === 3 ? 100 : progress} />
                <div className="flex justify-between">
                  {steps.map((s, i) => (
                    <div key={s} className={cn("flex items-center gap-1.5 text-xs", i <= stepIndex ? "text-foreground" : "text-muted-foreground")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", i <= stepIndex ? "bg-primary" : "bg-white/15")} />
                      {s}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Card><CardContent className="space-y-3 p-6"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
      ) : resume ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                {resume.fileName}
                <Badge variant="success">Ready</Badge>
              </CardTitle>
              <CardDescription>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove resume"
              disabled={deleteResume.isPending}
              onClick={() => deleteResume.mutate(resume.id)}
            >
              {deleteResume.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{resume.summary}</p>
            <div className="flex flex-wrap gap-2">
              {resume.skills?.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </CardContent>
        </Card>
      ) : (
        !pendingFile && (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No resume on file"
            description="Upload one above so your interview questions get more specific over time."
          />
        )
      )}
    </div>
  )
}
