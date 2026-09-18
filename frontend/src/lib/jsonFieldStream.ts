/**
 * Incrementally extracts the value of one string field from raw JSON text
 * that's arriving in fragments (e.g. streamed token-by-token from an
 * LLM). Used so the UI can show a question "typing in" character by
 * character while the backend is still generating the full JSON payload
 * `{ "topic": "...", "question": "..." }` / `{ ..., "nextQuestion": "..." }`
 * around it.
 *
 * This intentionally only handles the shape our backend actually emits —
 * a top-level, non-nested string field with standard JSON escaping — not
 * arbitrary JSON. It never throws; malformed input just stops yielding
 * new characters.
 */
export class JsonFieldStreamExtractor {
  private buffer = ""
  private fieldStarted = false
  private fieldEnded = false
  private value = ""
  private readonly fieldMarker: string

  constructor(fieldName: string) {
    this.fieldMarker = `"${fieldName}"`
  }

  /** Feed the next raw text chunk in. Returns the field value extracted so far. */
  push(chunk: string): string {
    if (this.fieldEnded) return this.value
    this.buffer += chunk

    if (!this.fieldStarted) {
      let searchPos = 0
      while (true) {
        const markerIndex = this.buffer.indexOf(this.fieldMarker, searchPos)
        if (markerIndex === -1) return this.value

        // Find the opening quote of the value, after "fieldName":
        const afterMarker = this.buffer.slice(markerIndex + this.fieldMarker.length)
        const colonMatch = afterMarker.match(/^\s*:\s*"/)
        if (colonMatch) {
          this.fieldStarted = true
          this.buffer = afterMarker.slice(colonMatch[0].length)
          break
        }

        // If afterMarker is just whitespace or a colon waiting for the quote to arrive in the next chunk:
        if (/^\s*:?\s*$/.test(afterMarker)) {
          return this.value
        }

        // If afterMarker contains non-colon/quote characters, this was a false match
        // (e.g. the word appeared inside another string field). Advance past it and keep searching.
        searchPos = markerIndex + this.fieldMarker.length
      }
    }


    // Consume characters until an unescaped closing quote.
    let i = 0
    let out = ""
    while (i < this.buffer.length) {
      const ch = this.buffer[i]
      if (ch === "\\" && i + 1 < this.buffer.length) {
        const next = this.buffer[i + 1]
        const escaped: Record<string, string> = {
          n: "\n",
          t: "\t",
          r: "\r",
          '"': '"',
          "\\": "\\",
        }
        out += escaped[next] ?? next
        i += 2
        continue
      }
      if (ch === '"') {
        this.fieldEnded = true
        i += 1
        break
      }
      out += ch
      i += 1
    }

    this.value += out
    this.buffer = this.buffer.slice(i)
    return this.value
  }

  get done() {
    return this.fieldEnded
  }
}
