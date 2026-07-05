import { GoogleGenAI } from "@google/genai";
class EmbeddingService {
    ai;
    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });
    }
    async generateEmbedding(text) {
        const response = await this.ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: text,
            config: {
                outputDimensionality: 768,
            },
        });
        return response.embeddings?.[0]?.values ?? [];
    }
}
export const embeddingService = new EmbeddingService();
