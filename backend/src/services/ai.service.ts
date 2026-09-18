import { retriever } from "../rag/retriever.js";
import { providerService } from "./ai/provider.service.js";

class AIService {
  async generate(prompt: string): Promise<string> {
    return providerService.generate(prompt);
  }

  generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    return providerService.generateStream(prompt);
  }

  async generateResponse(
    prompt: string,
    userId: string,
    resumeId: string
  ): Promise<string> {
    const finalPrompt = await this.buildChatPrompt(prompt, userId, resumeId);
    return providerService.generate(finalPrompt);
  }

  async *generateResponseStream(
    prompt: string,
    userId: string,
    resumeId: string
  ): AsyncGenerator<string, void, unknown> {
    const finalPrompt = await this.buildChatPrompt(prompt, userId, resumeId);
    yield* providerService.generateStream(finalPrompt);
  }

  private async buildChatPrompt(
    prompt: string,
    userId: string,
    resumeId: string
  ): Promise<string> {
    const context = await retriever.retrieve(prompt, userId, resumeId);

    const resumeContext =
      context.length > 0
        ? context.join("\n\n")
        : "No relevant resume context found.";

    return `
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
  }
}

export const aiService = new AIService();