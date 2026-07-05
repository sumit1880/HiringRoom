import { ChromaClient } from "chromadb";

class VectorStore {
  private client = new ChromaClient({
    path: "http://localhost:8000",
  });

async getCollection() {
  return await this.client.getOrCreateCollection({
    name: "resume_chunks",
    embeddingFunction: null as any,
  });
}

  async addDocument(
    id: string,
    text: string,
    embedding: number[],
    userId: string
  ) {
    const collection = await this.getCollection();

    await collection.add({
      ids: [id],
      documents: [text],
      embeddings: [embedding],
      metadatas: [
        {
          userId,
        },
      ],
    });
  }
}

export const vectorStore = new VectorStore();