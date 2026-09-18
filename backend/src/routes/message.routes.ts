import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
  sendMessage,
  sendMessageStream,
  getMessages,
} from "../controllers/message.controller.js";

const router = Router();

router.use(protect);

/**
 * Send message (user or AI)
 */
router.post("/:id/messages", sendMessage);

/**
 * Streaming variant — Server-Sent Events, token-by-token AI reply.
 */
router.post("/:id/messages/stream", sendMessageStream);

/**
 * Get chat history
 */
router.get("/:id/messages", getMessages);

export default router;