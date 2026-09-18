import "dotenv/config";
import { Worker, Job } from "bullmq";
import pLimit from "p-limit";
import { randomUUID } from "crypto";

import {
  queueConnection,
  RESUME_PROCESSING_QUEUE,
  ResumeProcessingJobData,
} from "./config/queue.js";
import { prisma } from "./config/prisma.js";
import { textChunker } from "./rag/textChunker.js";
import { embeddingService } from "./rag/embedding.js";
import { vectorStore } from "./rag/vectorStore.js";

// Embedding generation was previously done inline in the upload request
// with a sequential `for...of` + `await` loop — every chunk waited on the
// previous one to finish, and the whole thing ran on the request thread,
// risking timeouts on larger resumes. This worker runs it off the
// request path (see resume.service.ts, which now just enqueues a job and
// returns immediately with embeddingStatus=PENDING) and generates
// embeddings with bounded concurrency instead of one at a time.
const EMBEDDING_CONCURRENCY = 5;

async function processResume(job: Job<ResumeProcessingJobData>) {
  const { resumeId, userId, extractedText } = job.data;

  await prisma.resume.update({
    where: { id: resumeId },
    data: { embeddingStatus: "PROCESSING" },
  });

  try {
    // Defensive: clear any partial chunks from a previous failed attempt
    // of this same resume before regenerating (job retries).
    await vectorStore.deleteByResumeId(resumeId);

    const chunks = textChunker.split(extractedText);
    const limit = pLimit(EMBEDDING_CONCURRENCY);

    await Promise.all(
      chunks.map((chunk) =>
        limit(async () => {
          const embedding = await embeddingService.generateEmbedding(chunk);
          await vectorStore.addDocument(
            randomUUID(),
            chunk,
            embedding,
            userId,
            resumeId
          );
        })
      )
    );

    await prisma.resume.update({
      where: { id: resumeId },
      data: { embeddingStatus: "COMPLETED" },
    });
  } catch (error) {
    console.error(`[resume-processing] job failed for resume ${resumeId}:`, error);
    await prisma.resume.update({
      where: { id: resumeId },
      data: { embeddingStatus: "FAILED" },
    });
    throw error; // let BullMQ apply its retry/backoff policy
  }
}

const worker = new Worker<ResumeProcessingJobData>(
  RESUME_PROCESSING_QUEUE,
  processResume,
  {
    connection: queueConnection,
    concurrency: 3, // resumes processed in parallel, not chunks within one
  }
);

worker.on("completed", (job) => {
  console.log(`[resume-processing] completed resume ${job.data.resumeId}`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[resume-processing] failed resume ${job?.data.resumeId}:`,
    err?.message
  );
});

console.log("Resume processing worker started.");
