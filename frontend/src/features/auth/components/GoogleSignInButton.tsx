import { useEffect, useRef, useState } from "react"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function GoogleSignInButton({
  onCredential,
  text = "continue_with",
}: {
  onCredential: (idToken: string) => void
  text?: "signin_with" | "signup_with" | "continue_with"
}) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(!!window.google)

  useEffect(() => {
    if (scriptReady) return
    const interval = setInterval(() => {
      if (window.google) {
        setScriptReady(true)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [scriptReady])

  useEffect(() => {
    if (!scriptReady || !buttonRef.current || !window.google) return

    if (!GOOGLE_CLIENT_ID) {
      console.error("VITE_GOOGLE_CLIENT_ID is not set")
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredential(response.credential),
      ux_mode: "popup",
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "pill",
      width: 320,
    })
  }, [scriptReady, text, onCredential])

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
      {!scriptReady && (
        <div className="h-11 w-full max-w-[320px] animate-pulse rounded-full bg-white/[0.06]" />
      )}
    </div>
  )
}