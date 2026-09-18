import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { redis } from "../config/redis.js";

// A real readiness check — the previous version always returned success
// without checking anything, which is misleading behind a load balancer
// or orchestrator doing readiness probes.
export async function healthCheck(_req: Request, res: Response) {
  const [dbOk, redisOk] = await Promise.all([
    prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
    redis
      .ping()
      .then((r) => r === "PONG")
      .catch(() => false),
  ]);

  const healthy = dbOk && redisOk;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? "Backend running successfully" : "Dependency check failed",
    dependencies: {
      database: dbOk ? "up" : "down",
      redis: redisOk ? "up" : "down",
    },
  });
}
