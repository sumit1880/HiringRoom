import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { AuthLayout } from "./components/AuthLayout"
import { GoogleSignInButton } from "./components/GoogleSignInButton"
import { Orb } from "@/components/shared/Orb"

export function LoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleCredential = async (idToken: string) => {
    setStatus("loading")
    try {
      await loginWithGoogle(idToken)
      setStatus("success")
      toast.success("Welcome back")
      setTimeout(() => navigate("/dashboard"), 600)
    } catch {
      setStatus("idle")
      toast.error("Couldn't sign you in with Google. Please try again.")
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in with Google to pick up where you left off.">
      <div className="flex flex-col items-center gap-6">
        {status === "success" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Orb state="idle" size={28} /> Signed in — redirecting…
          </div>
        ) : status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Orb state="thinking" size={28} /> Signing you in…
          </div>
        ) : (
          <GoogleSignInButton onCredential={handleCredential} text="signin_with" />
        )}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By continuing you agree to our <a href="#" className="underline hover:text-foreground">Terms</a> and{" "}
        <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </AuthLayout>
  )
}