import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "REDIS_URL is not set. Add it to your environment before starting the server."
  );
}

// Single shared Redis connection for the whole app — same pattern as
// src/config/prisma.ts. Both the rate limiter (Step 2) and the resume
// context cache (Step 3) will import this client rather than opening
// their own connections.
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
});