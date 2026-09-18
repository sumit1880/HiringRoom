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

// In production ALLOWED_ORIGINS must be set (comma-separated). In
// development we fall back to reflecting the request origin so local
// frontend dev servers keep working without extra config.
app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? env.ALLOWED_ORIGINS.length > 0
          ? env.ALLOWED_ORIGINS
          : false
        : true,
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