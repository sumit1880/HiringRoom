import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
  createInterview,
  getAllInterviews,
  getInterviewById,
  completeInterview,
  deleteInterview,
  startInterview,
  startInterviewStream,
  answerInterviewQuestion,
  answerInterviewQuestionStream,
  getInterviewFeedback,
  getInterviewReportPdf,
  getInterviewQuestions,
  getInterviewTranscript,
} from "../controllers/interview.controller.js";

const router = Router();

router.use(protect);

router.post("/", createInterview);

router.get("/", getAllInterviews);

router.get("/:id", getInterviewById);

router.get("/:id/questions", getInterviewQuestions);

router.get("/:id/transcript", getInterviewTranscript);

router.post("/:id/start", startInterview);
router.post("/:id/start/stream", startInterviewStream);

router.patch("/:id/complete", completeInterview);

router.delete("/:id", deleteInterview);

router.post("/:id/answer", answerInterviewQuestion);
router.post("/:id/answer/stream", answerInterviewQuestionStream);

router.get("/:id/feedback", getInterviewFeedback);

router.get("/:id/report.pdf", getInterviewReportPdf);

export default router;