import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

const WINDOW_MS =
  Number(process.env.INTERVIEW_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS =
  Number(process.env.INTERVIEW_RATE_LIMIT_MAX) || 60;


export const interviewRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<any>,
  }),
  message: {
    success: false,
    message:
      "Too many interview requests. Please slow down and try again shortly.",
  },
});