import { prisma } from "../config/prisma.js";

/**
 * Postgres + pgvector-backed vector store.
 *
 * `ResumeChunk.embedding` is declared `Unsupported("vector(768)")` in
 * schema.prisma, so Prisma Client has no typed accessor for it — all
 * reads/writes go through raw SQL. This also means similarity search
 * (see retriever.ts) runs as a native `ORDER BY embedding <=> $1` query
 * with an ivfflat index, instead of pulling every row into Node and
 * scoring with a JS loop.
 */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

class VectorStore {
  async addDocument(
    id: string,
    text: string,
    embedding: number[],
    userId: string,
    resumeId: string
  ) {
    const vectorLiteral = toVectorLiteral(embedding);

    await prisma.$executeRaw`
      INSERT INTO "ResumeChunk" (id, content, embedding, "userId", "resumeId", "createdAt")
      VALUES (
        ${id},
        ${text},
        ${vectorLiteral}::vector,
        ${userId},
        ${resumeId},
        now()
      )
    `;
  }

  /** Used when re-processing a resume, to clear its previous chunks first. */
  async deleteByResumeId(resumeId: string) {
    await prisma.$executeRaw`DELETE FROM "ResumeChunk" WHERE "resumeId" = ${resumeId}`;
  }
}

export const vectorStore = new VectorStore();
export { toVectorLiteral };
