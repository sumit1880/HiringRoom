import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { AuthLayout } from "./components/AuthLayout"
import { GoogleSignInButton } from "./components/GoogleSignInButton"
import { Orb } from "@/components/shared/Orb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function RegisterPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [email, setEmail] = useState("")
  const { loginWithGoogle, loginAsDemo } = useAuth()
  const navigate = useNavigate()

  const handleCredential = async (idToken: string) => {
    setStatus("loading")
    try {
      await loginWithGoogle(idToken)
      setStatus("success")
      toast.success("Account ready")
      setTimeout(() => navigate("/dashboard"), 600)
    } catch {
      setStatus("idle")
      toast.error("Couldn't create your account with Google. Please try again.")
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }
    setStatus("loading")
    try {
      const derivedName = email.split("@")[0].replace(/[._-]/g, " ")
      await loginAsDemo(email.trim(), derivedName)
      setStatus("success")
      toast.success(`Account created for ${email}`)
      setTimeout(() => navigate("/dashboard"), 500)
    } catch {
      setStatus("idle")
      toast.error("Sign up failed. Make sure backend is running.")
    }
  }

  const handleDemoLogin = async () => {
    setStatus("loading")
    try {
      await loginAsDemo()
      setStatus("success")
      toast.success("Welcome to TheHiringRoom Demo")
      setTimeout(() => navigate("/dashboard"), 500)
    } catch {
      setStatus("idle")
      toast.error("Demo registration failed. Make sure backend is running.")
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free to start. Sign up in one click."
      quote={`\u201cThree sessions in, I stopped rambling and started structuring.\u201d`}
      quoteAuthor={`Marcus T. \u2014 New grad SWE`}
    >
      <div className="flex flex-col items-center gap-5 w-full">
        {status === "success" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Orb state="idle" size={28} /> Account ready — redirecting…
          </div>
        ) : status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Orb state="thinking" size={28} /> Setting up your account…
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailSignup} className="w-full space-y-3">
              <Input
                type="email"
                placeholder="Enter your email (e.g. sumitatprakash09@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-white/[0.03]"
                autoFocus
              />
              <Button type="submit" className="w-full h-11 rounded-xl font-medium">
                Create Account
              </Button>
            </form>

            <div className="flex items-center gap-3 w-full my-1">
              <div className="h-[1px] flex-1 bg-border/60" />
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">or</span>
              <div className="h-[1px] flex-1 bg-border/60" />
            </div>

            <GoogleSignInButton onCredential={handleCredential} text="signup_with" />

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2 hover:bg-white/[0.04]"
            >
              <Orb state="idle" size={14} />
              Quick Guest Demo Access
            </button>
          </>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By continuing you agree to our <a href="#" className="underline hover:text-foreground">Terms</a> and{" "}
        <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </AuthLayout>
  )
}