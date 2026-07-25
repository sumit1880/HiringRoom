import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
  getDashboardStats,
  getRecentSessions,
  getScoreTrend,
  getAchievements,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(protect);

router.get("/stats", getDashboardStats);

router.get("/recent-sessions", getRecentSessions);

router.get("/score-trend", getScoreTrend);

router.get("/achievements", getAchievements);

export default router;
