import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { messageService } from "../services/message.service.js";
import { aiService } from "../services/ai.service.js";
import { interviewService } from "../services/interview.service.js";

export const sendMessage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "content is required");
    }

    const sessionId = req.params.id;

    // 1. Save USER message
    const userMessage = await messageService.addMessage(
      sessionId,
      "USER",
      content,
      req.user.id
    );

    // 2. Generate AI response — scoped to the specific resume this
    // session is using, not just the user, so RAG context doesn't blend
    // in chunks from the user's other resumes.
    const resumeId = await interviewService.getResumeIdForSession(
      sessionId,
      req.user.id
    );

    const aiResponseText = await aiService.generateResponse(
      content,
      req.user.id,
      resumeId
    );

    // 3. Save AI message
    const aiMessage = await messageService.addMessage(
      sessionId,
      "AI",
      aiResponseText,
      req.user.id
    );

    // 4. Return both
    res.status(201).json({
      success: true,
      data: {
        userMessage,
        aiMessage,
      },
    });
  }
);

export const getMessages = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const messages = await messageService.getMessages(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  }
);

/**
 * SSE variant of sendMessage — streams the AI's reply token-by-token as
 * it's generated instead of waiting for the full response. The user
 * message is saved up front (same as the non-streaming path); the AI
 * message is saved once the stream completes, then a final `done` event
 * carries both full messages so the client can reconcile its optimistic
 * UI state.
 */
export const sendMessageStream = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "content is required");
    }

    const sessionId = req.params.id;

    const userMessage = await messageService.addMessage(
      sessionId,
      "USER",
      content,
      req.user.id
    );

    const resumeId = await interviewService.getResumeIdForSession(
      sessionId,
      req.user.id
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // If the client disconnects mid-stream, stop generating — nothing
    // downstream is listening to write() calls after this anyway, but
    // this lets us short-circuit the loop below.
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
    });

    res.write(`event: user_message\ndata: ${JSON.stringify(userMessage)}\n\n`);

    let fullText = "";

    try {
      for await (const chunk of aiService.generateResponseStream(
        content,
        req.user.id,
        resumeId
      )) {
        if (clientDisconnected) break;
        fullText += chunk;
        res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    } catch (error: any) {
      if (!clientDisconnected) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: error?.message ?? "AI generation failed",
          })}\n\n`
        );
        res.end();
      }
      return;
    }

    if (clientDisconnected) return;

    const aiMessage = await messageService.addMessage(
      sessionId,
      "AI",
      fullText,
      req.user.id
    );

    res.write(`event: done\ndata: ${JSON.stringify({ aiMessage })}\n\n`);
    res.end();
  }
);