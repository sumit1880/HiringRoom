import { prisma } from "../config/prisma.js";
import { resumeProcessor } from "../rag/resumeProcessor.js";
import { textChunker } from "../rag/textChunker.js";
import { embeddingService } from "../rag/embedding.js";
import { vectorStore } from "../rag/vectorStore.js";
import { randomUUID } from "crypto";

export const uploadResume = async (
  userId: string,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  // Step 1: Extract text from PDF
  const extractedText = await resumeProcessor.extractText(file.buffer);

  // Step 2: Split into chunks
  const chunks = textChunker.split(extractedText);

  console.log(`Chunks created: ${chunks.length}`);

  // Step 3: Generate embeddings
for (const chunk of chunks) {
  const embedding =
    await embeddingService.generateEmbedding(chunk);

  await vectorStore.addDocument(
    randomUUID(),
    chunk,
    embedding,
    userId
  );

  console.log(
    "Stored:",
    chunk.substring(0, 60)
  );
}

  // Step 4: Save resume
  const resume = await prisma.resume.create({
    data: {
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileUrl: "local-upload",
      extractedText,
      embeddingStatus: "COMPLETED",
    },
  });

 

  return resume;
};

export const getUserResumes = async (userId: string) => {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
};

export const getResumeById = async (id: string, userId: string) => {
  return prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
  });
};

export const deleteResume = async (id: string, userId: string) => {
  return prisma.resume.deleteMany({
    where: {
      id,
      userId,
    },
  });
};