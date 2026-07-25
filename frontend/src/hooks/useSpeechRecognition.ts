import { useCallback, useEffect, useRef, useState } from "react"

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | undefined {
  if (typeof window === "undefined") return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

/**
 * Browser-based speech-to-text using the Web Speech API only — no audio
 * upload, no backend involvement. Finalized speech segments are pushed to
 * `onFinalResult` as they're recognized so the caller can append them
 * straight into an answer box.
 */
export function useSpeechRecognition(onFinalResult: (text: string) => void) {
  const isSupported = !!getSpeechRecognitionCtor()

  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onFinalResultRef = useRef(onFinalResult)
  onFinalResultRef.current = onFinalResult

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()

    if (!Ctor) {
      setError("Speech recognition isn't supported in this browser. Try Chrome or Edge.")
      return
    }

    setError(null)
    setInterimTranscript("")

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let finalChunk = ""
      let interimChunk = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript
        } else {
          interimChunk += result[0].transcript
        }
      }

      if (finalChunk.trim()) {
        onFinalResultRef.current(finalChunk.trim())
      }
      setInterimTranscript(interimChunk)
    }

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Allow microphone permission to use speech-to-text.")
      } else if (event.error === "no-speech") {
        // Benign — user was just quiet. Don't surface as an error.
      } else if (event.error !== "aborted") {
        setError("Speech recognition hit an error. Please try again.")
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript("")
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  // Stop cleanly if the component unmounts while listening.
  useEffect(() => () => recognitionRef.current?.stop(), [])

  return { isSupported, isListening, interimTranscript, error, start, stop }
}
