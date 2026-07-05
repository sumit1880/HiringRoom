import { prisma } from "../config/prisma.js";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";

class MessageService {
  async addMessage(
    sessionId: string,
    role: Role,
    content: string,
    userId: string
  ) {
    // Ensure session belongs to user
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new ApiError(404, "Interview session not found");
    }

    return prisma.message.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  }

  async getMessages(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new ApiError(404, "Interview session not found");
    }

    return prisma.message.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}

export const messageService = new MessageService();