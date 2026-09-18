import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "./types.js";
import { AIProviderError } from "./ai.error.js";
import { env } from "../../config/env.js";

class GeminiProvider implements AIProvider {
  public readonly name = "Gemini";

  private ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  async generate(prompt: string): Promise<string> {
  try {
    // The SDK doesn't take a timeout option directly, so race it against
    // one manually — a hung Gemini call would otherwise never resolve.
    const response = await Promise.race([
      this.ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new AIProviderError(this.name, 503, "Gemini request timed out")),
          env.AI_PROVIDER_TIMEOUT_MS
        )
      ),
    ]);

    return response.text ?? "";
  } catch (error: any) {
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError(
      this.name,
      error.status ?? 500,
      error.message ?? "Gemini Error"
    );
  }
}

  async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.ai.models.generateContentStream({
        model: "gemini-flash-latest",
        contents: prompt,
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) yield text;
      }
    } catch (error: any) {
      throw new AIProviderError(
        this.name,
        error.status ?? 500,
        error.message ?? "Gemini streaming error"
      );
    }
  }
}

export const geminiProvider =
  new GeminiProvider();