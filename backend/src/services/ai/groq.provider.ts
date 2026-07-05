import fetch from "node-fetch";
import { AIProvider } from "./types.js";

class GroqProvider implements AIProvider {
  public readonly name = "Groq";

  async generate(prompt: string): Promise<string> {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data: any = await response.json();

    return (
      data.choices?.[0]?.message?.content ?? ""
    );
  }
}

export const groqProvider =
  new GroqProvider();