import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { AuthLayout } from "./components/AuthLayout"
import { GoogleSignInButton } from "./components/GoogleSignInButton"
import { Orb } from "@/components/shared/Orb"

export function RegisterPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
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
      quote="“Three sessions in, I stopped rambling and started structuring.”"
      quoteAuthor="Marcus T. — New grad SWE"
    >
      <div className="flex flex-col items-center gap-5 w-full">
        {status === "success" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Orb state="idle" size={28} /> Account ready — redirecting…
          </div>
        ) : status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Orb state="thinking" size={28} /> Setting up your account…
          </div>
        ) : (
          <>
            <GoogleSignInButton onCredential={handleCredential} text="signup_with" />
            
            <div className="flex items-center gap-3 w-full my-1">
              <div className="h-[1px] flex-1 bg-border/60" />
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">or</span>
              <div className="h-[1px] flex-1 bg-border/60" />
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-primary/20 bg-primary/5 hover:bg-primary/10 text-foreground transition-all duration-200 flex items-center justify-center gap-2 hover:border-primary/40 active:scale-[0.99]"
            >
              <Orb state="idle" size={16} />
              Continue as Demo Candidate
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