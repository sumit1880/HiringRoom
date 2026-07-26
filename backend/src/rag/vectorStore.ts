import { prisma } from "../config/prisma.js";

/**
 * Postgres-backed replacement for the former ChromaDB vector store.
 * Embeddings are stored directly on the ResumeChunk table (see
 * prisma/schema.prisma) instead of in an external Chroma collection.
 */
class VectorStore {
  async addDocument(
    id: string,
    text: string,
    embedding: number[],
    userId: string
  ) {
    await prisma.resumeChunk.create({
      data: {
        id,
        content: text,
        embedding,
        userId,
      },
    });
  }
}

export const vectorStore = new VectorStore();
