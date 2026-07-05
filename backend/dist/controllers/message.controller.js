import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { messageService } from "../services/message.service.js";
import { aiService } from "../services/ai.service.js"; // ✅ FIXED IMPORT
export const sendMessage = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "content is required");
    }
    const sessionId = req.params.id;
    // 1. Save USER message
    const userMessage = await messageService.addMessage(sessionId, "USER", content, req.user.id);
    // 2. Generate AI response
    const aiResponseText = await aiService.generateResponse(content, req.user.id);
    // 3. Save AI message
    const aiMessage = await messageService.addMessage(sessionId, "AI", aiResponseText, req.user.id);
    // 4. Return both
    res.status(201).json({
        success: true,
        data: {
            userMessage,
            aiMessage,
        },
    });
});
export const getMessages = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    const messages = await messageService.getMessages(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        data: messages,
    });
});
