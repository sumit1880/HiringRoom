
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
    return {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    };
  }

  private async handleError(
    response: Response
  ): Promise<never> {
    const errorText = await response.text();

    throw new AIProviderError(
      this.name,
      response.status,
      errorText || `OpenRouter request failed: ${response.status}`
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

    if (typeof content !== "string") {
      throw new AIProviderError(
        this.name,
        502,
        "OpenRouter returned an invalid response."
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
        502,
        "OpenRouter returned no response body."
      );
    }

    yield* parseOpenAIStyleSSE(
      response.body as unknown as NodeJS.ReadableStream
    );
  }
}

export const openRouterProvider = new OpenRouterProvider();
