import { Queue } from "bullmq";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "REDIS_URL is not set. Add it to your environment before starting the server."
  );
}

// BullMQ requires its own connection with maxRetriesPerRequest set to
// null (it manages retries/blocking itself) — reusing the app's regular
// `redis` client (config/redis.ts, maxRetriesPerRequest: 3) would cause
// BullMQ's blocking commands to fail.
export const queueConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const RESUME_PROCESSING_QUEUE = "resume-processing";

export const resumeProcessingQueue = new Queue(RESUME_PROCESSING_QUEUE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 200,
    removeOnFail: 500,
  },
});

export interface ResumeProcessingJobData {
  resumeId: string;
  userId: string;
  extractedText: string;
}
