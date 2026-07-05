import { ChromaClient } from "chromadb";
import { embeddingService } from "./embedding.js";
class Retriever {
    client = new ChromaClient({
        path: "http://localhost:8000",
    });
    async retrieve(question, userId) {
        const embedding = await embeddingService.generateEmbedding(question);
        const collection = await this.client.getOrCreateCollection({
            name: "resume_chunks",
            embeddingFunction: null,
        });
        const result = await collection.query({
            queryEmbeddings: [embedding],
            nResults: 5,
            where: {
                userId,
            },
        });
        const docs = result.documents?.[0] ?? [];
        console.log("📦 Retrieving from Chroma for:", userId);
        return docs.filter((doc) => doc !== null);
    }
}
export const retriever = new Retriever();
