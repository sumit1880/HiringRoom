import { retriever } from "../rag/retriever.js";
import { providerService } from "./ai/provider.service.js";
class AIService {
    async generate(prompt) {
        return providerService.generate(prompt);
    }
    async generateResponse(prompt, userId) {
        console.log("🔍 AIService triggered RAG");
        const context = await retriever.retrieve(prompt, userId);
        const resumeContext = context.length > 0
            ? context.join("\n\n")
            : "No relevant resume context found.";
        const finalPrompt = `
You are an expert AI interview coach.

Use the resume context below to answer the user's question.

Resume Context:
${resumeContext}

User Question:
${prompt}

Rules:
- Be concise.
- Be interview-focused.
- If resume information is available, prioritize it.
`.trim();
        return providerService.generate(finalPrompt);
    }
}
export const aiService = new AIService();
