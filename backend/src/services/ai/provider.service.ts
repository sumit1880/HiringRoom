import { AIProvider } from "./types.js";
import { geminiProvider } from "./gemini.provider.js";
import { openRouterProvider } from "./openrouter.provider.js";
import { groqProvider } from "./groq.provider.js";
import { AIProviderError } from "./ai.error.js";

class ProviderService {
  private providers: AIProvider[] = [
    geminiProvider,
    openRouterProvider,
    groqProvider,
  ];

  /**
   * Providers temporarily skipped because of quota/rate limits.
   *
   * key   -> provider name
   * value -> timestamp (ms) until provider can be retried
   */
  private cooldowns = new Map<
    string,
    {
      until: number;
      reason: string;
    }
  >();

  async generate(prompt: string): Promise<string> {
    let lastError: unknown;

    for (const provider of this.providers) {
      if (this.isCoolingDown(provider.name)) {
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

          this.cooldowns.set(provider.name, {
            until: Date.now() + 30 * 60 * 1000,
            reason: error.message ?? "Rate limit",
          });

          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error("No AI provider available.");
  }

  private isCoolingDown(providerName: string): boolean {
    const cooldown = this.cooldowns.get(providerName);

    if (!cooldown) {
      return false;
    }

    if (Date.now() > cooldown.until) {
      this.cooldowns.delete(providerName);
      return false;
    }

    return true;
  }

  private isRetryable(error: unknown): boolean {
    if (!(error instanceof AIProviderError)) {
      return false;
    }

    return error.retryable;
  }
}

export const providerService = new ProviderService();