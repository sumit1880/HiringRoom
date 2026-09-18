import { AIProvider } from "./types.js";
import { geminiProvider } from "./gemini.provider.js";
import { openRouterProvider } from "./openrouter.provider.js";
import { groqProvider } from "./groq.provider.js";
import { AIProviderError } from "./ai.error.js";
import { redis } from "../../config/redis.js";

const COOLDOWN_KEY_PREFIX = "ai:cooldown:";
const COOLDOWN_MS = 30 * 60 * 1000;

class ProviderService {
  private providers: AIProvider[] = [
    geminiProvider,
    openRouterProvider,
    groqProvider,
  ];

  async generate(prompt: string): Promise<string> {
    let lastError: unknown;

    for (const provider of this.providers) {
      if (await this.isCoolingDown(provider.name)) {
        console.log(`[AI] Skipping ${provider.name} (cooldown)`);
        continue;
      }

      try {
        console.log(`[AI] Trying ${provider.name}`);

        const response = await provider.generate(prompt);

        console.log(`[AI] ${provider.name} succeeded`);

        return response;
      } catch (error: any) {
        lastError = error;

        console.error(`[AI] ${provider.name} failed`);

        if (this.isRetryable(error)) {
          console.log(`[AI] ${provider.name} entered cooldown`);

          await this.setCooldown(provider.name, error.message ?? "Rate limit");

          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error("No AI provider available.");
  }

  /**
   * Provider cooldowns previously lived in an in-process Map, which only
   * works correctly on a single server instance — each horizontally
   * scaled instance had its own view of which providers were down, and
   * state reset on every restart/deploy. Redis makes this consistent
   * across all instances, same as the rate limiter.
   */
  private async isCoolingDown(providerName: string): Promise<boolean> {
    const until = await redis.get(COOLDOWN_KEY_PREFIX + providerName);
    return until !== null;
  }

  private async setCooldown(providerName: string, reason: string) {
    await redis.set(
      COOLDOWN_KEY_PREFIX + providerName,
      reason,
      "PX",
      COOLDOWN_MS
    );
  }

  private isRetryable(error: unknown): boolean {
    if (!(error instanceof AIProviderError)) {
      return false;
    }

    return error.retryable;
  }

  /**
   * Streaming counterpart to generate(). Fallback to the next provider is
   * only possible BEFORE the first chunk has been yielded to the caller —
   * once a caller has started forwarding tokens to a client (e.g. over
   * SSE), switching providers mid-stream would produce a garbled,
   * inconsistent response. After the first chunk, any error is thrown
   * as-is rather than triggering a silent provider switch.
   */
  async *generateStream(
    prompt: string
  ): AsyncGenerator<string, void, unknown> {
    let lastError: unknown;

    for (const provider of this.providers) {
      if (await this.isCoolingDown(provider.name)) {
        console.log(`[AI] Skipping ${provider.name} (cooldown)`);
        continue;
      }

      const iterator = provider.generateStream(prompt);
      let startedYielding = false;

      try {
        for await (const chunk of iterator) {
          startedYielding = true;
          yield chunk;
        }
        return;
      } catch (error: any) {
        lastError = error;
        console.error(`[AI] ${provider.name} streaming failed`);

        if (startedYielding) {
          // Already committed to this provider and sent partial output
          // to the caller — can't silently retry another one now.
          throw error;
        }

        if (this.isRetryable(error)) {
          console.log(`[AI] ${provider.name} entered cooldown`);
          await this.setCooldown(provider.name, error.message ?? "Rate limit");
          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error("No AI provider available.");
  }
}

export const providerService = new ProviderService();
