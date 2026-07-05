import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import messageRoutes from "./routes/message.routes.js";
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
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/interviews", messageRoutes);
app.use(errorMiddleware);
export default app;
