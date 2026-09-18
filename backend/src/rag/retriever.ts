import { prisma } from "../config/prisma.js";
import { embeddingService } from "./embedding.js";
import { toVectorLiteral } from "./vectorStore.js";

const TOP_K = 5;

interface RetrievedChunk {
  content: string;
}

/**
 * pgvector-backed retriever. Similarity search now runs natively in
 * Postgres (`embedding <=> query_vector`, ascending = most similar first,
 * backed by an ivfflat index) instead of fetching every chunk for a user
 * into Node and computing cosine similarity in a JS loop — the latter
 * doesn't scale past a handful of resumes/users and ships every raw
 * embedding vector over the wire on every single question.
 *
 * Retrieval is scoped to a specific resumeId, not just userId — a user
 * with multiple resumes previously got RAG context blended across all of
 * them regardless of which resume the interview/chat session was using.
 */
class Retriever {
  async retrieve(question: string, userId: string, resumeId: string): Promise<string[]> {
    const embedding = await embeddingService.generateEmbedding(question);
    const vectorLiteral = toVectorLiteral(embedding);

    const chunks = await prisma.$queryRaw<RetrievedChunk[]>`
      SELECT content
      FROM "ResumeChunk"
      WHERE "userId" = ${userId} AND "resumeId" = ${resumeId}
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${TOP_K}
    `;

    return chunks.map((c) => c.content);
  }
}

export const retriever = new Retriever();
