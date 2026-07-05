import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
  sendMessage,
  getMessages,
} from "../controllers/message.controller.js";

const router = Router();

router.use(protect);

/**
 * Send message (user or AI)
 */
router.post("/:id/messages", sendMessage);

/**
 * Get chat history
 */
router.get("/:id/messages", getMessages);

export default router;