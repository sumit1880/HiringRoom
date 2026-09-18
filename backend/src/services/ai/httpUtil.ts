import fetch, { RequestInit, Response } from "node-fetch";
import { env } from "../../config/env.js";

/**
 * Parses an OpenAI-compatible chat-completions SSE stream (`data: {...}`
 * lines, terminated by `data: [DONE]`) into plain text deltas. Shared by
 * Groq and OpenRouter, which both use this exact wire format.
 */
export async function* parseOpenAIStyleSSE(
  body: NodeJS.ReadableStream
): AsyncGenerator<string, void, unknown> {
  let buffer = "";

  for await (const rawChunk of body) {
    buffer += rawChunk.toString("utf-8");

    const lines = buffer.split("\n");
    // Keep the last (possibly incomplete) line in the buffer for the next
    // iteration.
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        // Ignore malformed/partial SSE frames rather than crashing the
        // whole stream over a single bad chunk.
      }
    }
  }
}

/**
 * fetch() with an AbortController-backed timeout. Without this, a hung
 * upstream AI provider can hold a request (and an event-loop slot) open
 * indefinitely, which is especially bad once the fallback chain and rate
 * limiter are under real load.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = env.AI_PROVIDER_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal as any });
  } finally {
    clearTimeout(timer);
  }
}
