import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

function makeRedisStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<any>,
  });
}

function makeLimiter(opts: {
  prefix: string;
  windowMs: number;
  max: number;
  message: string;
}) {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: makeRedisStore(opts.prefix),
    // Rate limit per authenticated user when available (set by `protect`,
    // which runs before these limiters on every route that uses them),
    // falling back to IP using ipKeyGenerator for IPv6 subnet normalization.
    keyGenerator: (req) => req.user?.id ?? (req.ip ? ipKeyGenerator(req.ip) : "anonymous"),
    message: {
      success: false,
      message: opts.message,
    },
  });
}

// Interview endpoints call an LLM per request — the most expensive and
// abusable path in the app.
export const interviewRateLimiter = makeLimiter({
  prefix: "rl:interview:",
  windowMs: Number(process.env.INTERVIEW_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.INTERVIEW_RATE_LIMIT_MAX) || 60,
  message: "Too many interview requests. Please slow down and try again shortly.",
});

// Resume upload triggers a PDF parse, an AI classification call, and one
// embedding call per chunk — expensive enough to need its own, tighter cap
// independent of the general API limiter.
export const resumeUploadRateLimiter = makeLimiter({
  prefix: "rl:resume-upload:",
  windowMs: Number(process.env.RESUME_UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.RESUME_UPLOAD_RATE_LIMIT_MAX) || 20,
  message: "Too many resume uploads. Please try again later.",
});

// Baseline limiter applied to every route (auth included) so no endpoint
// is left completely unprotected.
export const generalRateLimiter = makeLimiter({
  prefix: "rl:general:",
  windowMs: Number(process.env.GENERAL_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.GENERAL_RATE_LIMIT_MAX) || 300,
  message: "Too many requests. Please slow down and try again shortly.",
});

