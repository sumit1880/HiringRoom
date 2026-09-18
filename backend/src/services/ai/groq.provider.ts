import { AIProvider } from "./types.js";
import { AIProviderError } from "./ai.error.js";
import { fetchWithTimeout, parseOpenAIStyleSSE } from "./httpUtil.js";

class GroqProvider implements AIProvider {
  public readonly name = "Groq";

  async generate(prompt: string): Promise<string> {
    let response;

    try {
      response = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );
    } catch (error: any) {
      // Network error / abort (timeout) — retryable, same as a 503.
      throw new AIProviderError(
        this.name,
        503,
        error?.message ?? "Groq request failed"
      );
    }

    if (!response.ok) {
      const error = await response.text();
      // Previously this threw a plain Error, which the provider fallback
      // chain's isRetryable() check doesn't recognize — Groq never
      // entered cooldown and a 429 here would bubble straight to the
      // caller instead of being retried/skipped like the other providers.
      throw new AIProviderError(this.name, response.status, error);
    }

    const data: any = await response.json();

    return (
      data.choices?.[0]?.message?.content ?? ""
    );
  }

  async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    let response;

    try {
      response = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            stream: true,
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );
    } catch (error: any) {
      throw new AIProviderError(
        this.name,
        503,
        error?.message ?? "Groq streaming request failed"
      );
    }

    if (!response.ok || !response.body) {
      const error = response.body ? await response.text() : "No response body";
      throw new AIProviderError(this.name, response.status, error);
    }

    yield* parseOpenAIStyleSSE(response.body as unknown as NodeJS.ReadableStream);
  }
}

export const groqProvider =
  new GroqProvider();