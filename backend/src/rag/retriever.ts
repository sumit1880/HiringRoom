import { prisma } from "../config/prisma.js";
import { embeddingService } from "./embedding.js";

const TOP_K = 5;

/**
 * Cosine similarity between two equal-length embedding vectors.
 * Returns 0 for degenerate (zero-magnitude) vectors instead of NaN.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const length = Math.min(a.length, b.length);

  for (let i = 0; i < length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Postgres-backed replacement for the former ChromaDB retriever.
 * Fetches the user's stored resume-chunk embeddings, scores them against
 * the query embedding with cosine similarity in TypeScript, and returns
 * the top matching chunk texts — mirroring the shape Chroma used to return.
 */
class Retriever {
  async retrieve(question: string, userId: string): Promise<string[]> {
    const embedding = await embeddingService.generateEmbedding(question);

    const chunks = await prisma.resumeChunk.findMany({
      where: { userId },
      select: {
        content: true,
        embedding: true,
      },
    });

    console.log("📦 Retrieving from PostgreSQL for:", userId);

    const scored = chunks
      .map((chunk) => ({
        content: chunk.content,
        score: cosineSimilarity(embedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    return scored
      .map((entry) => entry.content)
      .filter((doc): doc is string => doc !== null);
  }
}

export const retriever = new Retriever();
