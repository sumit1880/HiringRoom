import { geminiProvider } from "./gemini.provider.js";
import { openRouterProvider } from "./openrouter.provider.js";
import { groqProvider } from "./groq.provider.js";
import { AIProviderError } from "./ai.error.js";
class ProviderService {
    providers = [
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
    cooldowns = new Map;
    async generate(prompt) {
        let lastError;
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
            }
            catch (error) {
                lastError = error;
                console.error(`[AI] ${provider.name} failed`);
                if (this.isRetryable(error)) {
                    console.log(`[AI] ${provider.name} entered cooldown`);
                    this.cooldowns.set(provider.name, {
                        until: Date.now() + 30 * 60 * 1000,
                        reason: error.message ?? "Rate limit"
                    });
                    continue;
                }
                throw error;
            }
        }
        throw (lastError ??
            new Error("No AI provider available."));
    }
    isCoolingDown(providerName) {
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
    isRetryable(error) {
        if (!(error instanceof AIProviderError)) {
            return false;
        }
        return error.retryable;
    }
}
export const providerService = new ProviderService();
