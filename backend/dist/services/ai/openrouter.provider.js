import fetch from "node-fetch";
import { AIProviderError } from "./ai.error.js";
class OpenRouterProvider {
    name = "OpenRouter";
    async generate(prompt) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        });
        if (!response.ok) {
            const error = await response.text();
            throw new AIProviderError(this.name, response.status, error);
        }
        const data = await response.json();
        return (data.choices?.[0]?.message?.content ?? "");
    }
}
export const openRouterProvider = new OpenRouterProvider();
