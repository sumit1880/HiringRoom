import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { dashboardService } from "../services/dashboard.service.js";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const stats = await dashboardService.getStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

export const getRecentSessions = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const sessions = await dashboardService.getRecentSessions(req.user.id);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  }
);

export const getScoreTrend = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const trend = await dashboardService.getScoreTrend(req.user.id);

    res.status(200).json({
      success: true,
      data: trend,
    });
  }
);

export const getAchievements = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const achievements = await dashboardService.getAchievements(req.user.id);

    res.status(200).json({
      success: true,
      data: achievements,
    });
  }
);
