import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
  createInterview,
  getAllInterviews,
  getInterviewById,
  completeInterview,
  deleteInterview,
  startInterview,
  answerInterviewQuestion,
} from "../controllers/interview.controller.js";

const router = Router();

router.use(protect);

router.post("/", createInterview);

router.get("/", getAllInterviews);

router.get("/:id", getInterviewById);

// ⭐ NEW
router.post("/:id/start", startInterview);

router.patch("/:id/complete", completeInterview);

router.delete("/:id", deleteInterview);

router.post("/:id/answer", answerInterviewQuestion);

export default router;