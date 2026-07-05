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

    const { title, type } = parsed.data;

    const session = await interviewService.createSession(
      req.user.id,
      title,
      type
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