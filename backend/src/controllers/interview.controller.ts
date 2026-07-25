import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { createInterviewSchema } from "../validators/interview.validator.js";
import { interviewService } from "../services/interview.service.js";


export const createInterview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const parsed = createInterviewSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.message);
    }

    const { title, type, difficulty, resumeId, durationMinutes } = parsed.data;

    const session = await interviewService.createSession(
      req.user.id,
      title,
      type,
      difficulty,
      resumeId,
      durationMinutes
    );

    res.status(201).json({
      success: true,
      message: "Interview session created",
      data: session,
    });
  }
);

export const getAllInterviews = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const sessions = await interviewService.getSessions(req.user.id);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  }
);

export const getInterviewById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const session = await interviewService.getSessionById(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  }
);

export const completeInterview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const session = await interviewService.completeSession(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Interview completed",
      data: session,
    });
  }
);

export const deleteInterview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    await interviewService.deleteSession(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Interview deleted",
    });
  }
);

/* ===========================
   START INTERVIEW
=========================== */

export const startInterview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const result = await interviewService.startInterview(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Interview started",
      data: result,
    });
  }
);

export const answerInterviewQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const { answer } = req.body;

    if (!answer || typeof answer !== "string") {
      throw new ApiError(400, "Answer is required");
    }

    const result = await interviewService.answerQuestion(
      req.params.id,
      req.user.id,
      answer
    );

    res.status(200).json({
      success: true,
      message: "Answer submitted",
      data: result,
    });
  }
);

export const getInterviewFeedback = asyncHandler(async (req, res) => {
  const session = await interviewService.getSessionById(
    req.params.id,
    req.user!.id
  );

  const answeredQuestions = session.questions.filter(q => q.evaluation);

  if (answeredQuestions.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        technicalScore: 0,
        communicationScore: 0,
        overallScore: 0,
        strengths: "",
        weaknesses: "",
        suggestions: "",
      },
    });
  }

  const technicalAverage =
    answeredQuestions.reduce(
      (sum, q) => sum + (q.evaluation?.technicalScore || 0),
      0
    ) / answeredQuestions.length;

  const communicationAverage =
    answeredQuestions.reduce(
      (sum, q) => sum + (q.evaluation?.communicationScore || 0),
      0
    ) / answeredQuestions.length;

  const confidenceAverage =
    answeredQuestions.reduce(
      (sum, q) => sum + (q.evaluation?.confidenceScore || 0),
      0
    ) / answeredQuestions.length;

  const overallScore =
    (technicalAverage + communicationAverage + confidenceAverage) / 3;

  // Pull strengths/weaknesses/per-question feedback together across every
  // answered question, de-duplicated, for a session-level summary.
  const dedupe = (items: string[]) => Array.from(new Set(items.map((s) => s.trim()).filter(Boolean)));

  const strengths = dedupe(
    answeredQuestions.flatMap((q) => q.evaluation?.strengths ?? [])
  );
  const weaknesses = dedupe(
    answeredQuestions.flatMap((q) => q.evaluation?.weaknesses ?? [])
  );
  const suggestions = dedupe(
    answeredQuestions.map((q) => q.evaluation?.feedback ?? "")
  );

  res.status(200).json({
    success: true,
    data: {
      sessionId: session.id,
      // The frontend's feedbackService already multiplies technicalScore/
      // communicationScore by 10 itself, so these are sent as raw 1-10
      // averages. overallScore is sent pre-scaled to 0-100 since the
      // frontend uses it as-is. (Verified against feedbackService.ts's
      // toInterviewFeedback — not guessed.)
      technicalScore: Math.round(technicalAverage * 10) / 10,
      communicationScore: Math.round(communicationAverage * 10) / 10,
      overallScore: Math.round(overallScore * 10),
      strengths: strengths.join("\n"),
      weaknesses: weaknesses.join("\n"),
      suggestions: suggestions.join("\n"),
    },
  });
});