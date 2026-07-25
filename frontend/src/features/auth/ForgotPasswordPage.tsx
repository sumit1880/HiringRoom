import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { MailCheck, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/authService"
import { AuthLayout } from "./components/AuthLayout"

const schema = z.object({ email: z.string().min(1, "Email is required").email("Enter a valid email") })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    await authService.forgotPassword(values.email)
    setSentTo(values.email)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to get back in."
      quote="“Practicing at 11pm before an 8am interview actually saved me.”"
      quoteAuthor="Sana K. — Staff Engineer"
    >
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@email.com" className="mt-1.5" error={!!errors.email} {...register("email")} />
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Send reset link
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl glass p-8 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
              <MailCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">Check your inbox</p>
              <p className="mt-1 text-sm text-muted-foreground">We sent a reset link to <span className="text-foreground">{sentTo}</span>.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/login" className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </AuthLayout>
  )
}
