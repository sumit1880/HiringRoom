import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import {
  interviewRateLimiter,
  resumeUploadRateLimiter,
  generalRateLimiter,
} from "./middlewares/rateLimiter.middleware.js";
import userRoutes from "./routes/user.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import messageRoutes from "./routes/message.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import { env } from "./config/env.js";
import { healthCheck } from "./controllers/health.controller.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

// Dynamic CORS: automatically allows any Vercel deployment (*.vercel.app),
// localhost dev servers, and any explicit origins in ALLOWED_ORIGINS.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Explicitly allowed in environment config
      if (env.ALLOWED_ORIGINS.length > 0 && env.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel deployments (*.vercel.app) & local dev
      if (
        /^https:\/\/.*\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Allow all in non-production
      if (env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Baseline rate limiting on every route, including auth — previously auth,
// resumes, profile and dashboard had no limiter at all.
app.use(generalRateLimiter);

app.get("/health", healthCheck);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/resumes/upload", resumeUploadRateLimiter);
app.use("/api/v1/resumes", resumeRoutes);

// Interview endpoints call an LLM per request — the most expensive and
// abusable path in the app, so they get a stricter limiter on top of the
// general one above.
app.use("/api/v1/interviews", interviewRateLimiter);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/interviews", messageRoutes);

app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(errorMiddleware);

export default app;