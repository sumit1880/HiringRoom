import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "./types.js";
import { AIProviderError } from "./ai.error.js";

class GeminiProvider implements AIProvider {
  public readonly name = "Gemini";

  private ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  async generate(prompt: string): Promise<string> {
  try {
    const response =
      await this.ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });

    return response.text ?? "";
  } catch (error: any) {
    throw new AIProviderError(
      this.name,
      error.status ?? 500,
      error.message ?? "Gemini Error"
    );
  }
}
}

export const geminiProvider =
  new GeminiProvider();