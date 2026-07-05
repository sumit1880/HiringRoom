import { GoogleGenAI } from "@google/genai";
import { AIProviderError } from "./ai.error.js";
class GeminiProvider {
    name = "Gemini";
    ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    async generate(prompt) {
        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text ?? "";
        }
        catch (error) {
            throw new AIProviderError(this.name, error.status ?? 500, error.message ?? "Gemini Error");
        }
    }
}
export const geminiProvider = new GeminiProvider();
