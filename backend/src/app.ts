import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { interviewRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import userRoutes from "./routes/user.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import messageRoutes from "./routes/message.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import profileRoutes from './routes/profile.routes.js'

const app = express();

app.use(cors());
app.use(express.json());


app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Backend running successfully",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/resumes", resumeRoutes);

// Rate limiter applies only to interview endpoints (both routers mounted
// below share this prefix) — these are the ones that call the LLM and
// cost real money per request. Everything else (auth, users, resumes,
// profile, dashboard) is intentionally left unlimited for now.
app.use("/api/v1/interviews", interviewRateLimiter);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/interviews", messageRoutes);

app.use('/api/v1/profile', profileRoutes)
app.use("/api/v1/dashboard", dashboardRoutes);


app.use(errorMiddleware);

export default app;