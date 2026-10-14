import fetch, {
  type RequestInit,
  type Response,
} from "node-fetch";
import { env } from "../../config/env.js";

/**
 * Parses OpenAI-compatible Server-Sent Events and yields text fragments.
 */
export async function* parseOpenAIStyleSSE(
  body: NodeJS.ReadableStream
): AsyncGenerator<string, void, unknown> {
  let buffer = "";

  for await (const rawChunk of body) {
    buffer += rawChunk.toString("utf-8");

    const lines = buffer.split("\\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      if (!data) continue;

      try {
        const parsed: unknown = JSON.parse(data);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "choices" in parsed
        ) {
          const choices = (parsed as {
            choices?: Array<{ delta?: { content?: unknown } }>;
          }).choices;
          const delta = choices?.[0]?.delta?.content;

          if (typeof delta === "string" && delta.length > 0) {
            yield delta;
          }
        }
      } catch (error) {
        // Log malformed chunks for diagnosis instead of silently hiding them.
        console.error("[AI] Failed to parse SSE data chunk:", error);
      }
    }
  }

  // Process a final line if the stream ends without a trailing newline.
  const finalLine = buffer.trim();
  if (finalLine.startsWith("data:")) {
    const data = finalLine.slice(5).trim();
    if (data && data !== "[DONE]") {
      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          yield delta;
        }
      } catch (error) {
        console.error("[AI] Failed to parse final SSE data chunk:", error);
      }
    }
  }
}

/**
 * Fetch helper with a timeout for establishing the upstream HTTP response.
 * Note: this timeout covers receiving the response headers, not the full
 * lifetime of a streaming response body.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = env.AI_PROVIDER_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
