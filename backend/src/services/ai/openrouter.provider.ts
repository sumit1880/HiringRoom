import { AIProvider } from "./types.js";
import { AIProviderError } from "./ai.error.js";
import { fetchWithTimeout, parseOpenAIStyleSSE } from "./httpUtil.js";

class OpenRouterProvider implements AIProvider {
  public readonly name = "OpenRouter";

  async generate(prompt: string): Promise<string> {
    let response;

    try {
      response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
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
      throw new AIProviderError(
        this.name,
        503,
        error?.message ?? "OpenRouter request failed"
      );
    }

    if (!response.ok) {
      const error = await response.text();
      throw new AIProviderError(
  this.name,
  response.status,
  error
);
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
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324",
            stream: true,
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );
    } catch (error: any) {
      throw new AIProviderError(
        this.name,
        503,
        error?.message ?? "OpenRouter streaming request failed"
      );
    }

    if (!response.ok || !response.body) {
      const error = response.body ? await response.text() : "No response body";
      throw new AIProviderError(this.name, response.status, error);
    }

    yield* parseOpenAIStyleSSE(response.body as unknown as NodeJS.ReadableStream);
  }
}

export const openRouterProvider =
  new OpenRouterProvider();