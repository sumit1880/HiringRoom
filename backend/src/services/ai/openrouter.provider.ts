
import type { Response } from "node-fetch";
import { AIProvider } from "./types.js";
import { AIProviderError } from "./ai.error.js";
import {
  fetchWithTimeout,
  parseOpenAIStyleSSE,
} from "./httpUtil.js";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const MODEL = "deepseek/deepseek-chat-v3-0324";
const MAX_TOKENS = 2048;

class OpenRouterProvider implements AIProvider {
  public readonly name = "OpenRouter";

  private getHeaders(): Record<string, string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new AIProviderError(
        this.name,
        503,
        "OPENROUTER_API_KEY is not configured"
      );
    }

    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private async handleError(
    response: Response
  ): Promise<never> {
    const body = await response.text();

    console.error(
      `[AI] OpenRouter HTTP ${response.status}: ${body}`
    );

    throw new AIProviderError(
      this.name,
      response.status,
      body ||
        `OpenRouter request failed with HTTP ${response.status}`
    );
  }

  async generate(prompt: string): Promise<string> {
    let response: Response;

    try {
      response = await fetchWithTimeout(OPENROUTER_URL, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIProviderError(
        this.name,
        503,
        error instanceof Error
          ? error.message
          : "OpenRouter request failed"
      );
    }

    if (!response.ok) {
      await this.handleError(response);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new AIProviderError(
        this.name,
        503,
        "OpenRouter returned an empty or invalid response"
      );
    }

    return content;
  }

  async *generateStream(
    prompt: string
  ): AsyncGenerator<string, void, unknown> {
    let response: Response;

    try {
      response = await fetchWithTimeout(OPENROUTER_URL, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          stream: true,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      throw new AIProviderError(
        this.name,
        503,
        error instanceof Error
          ? error.message
          : "OpenRouter streaming request failed"
      );
    }

    if (!response.ok) {
      await this.handleError(response);
    }

    if (!response.body) {
      throw new AIProviderError(
        this.name,
        503,
        "OpenRouter returned no response body"
      );
    }

    yield* parseOpenAIStyleSSE(
      response.body as unknown as NodeJS.ReadableStream
    );
  }
}

export const openRouterProvider = new OpenRouterProvider();
