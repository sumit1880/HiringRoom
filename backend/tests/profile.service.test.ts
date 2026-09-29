import { describe, it, expect, vi } from "vitest";
import { profileService } from "../src/services/profile.service.js";
import { prisma } from "../src/config/prisma.js";

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    interviewSession: {
      findMany: vi.fn(),
    },
  },
}));

describe("Profile Service", () => {
  describe("Streak Calculation", () => {
    it("should calculate current streak correctly", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const mockSessions = [
        { endedAt: today, questions: [] },
        { endedAt: yesterday, questions: [] },
        { endedAt: twoDaysAgo, questions: [] }
      ];

      (prisma.user.findUnique as any).mockResolvedValue({ createdAt: new Date() });
      (prisma.interviewSession.findMany as any).mockResolvedValue(mockSessions);

      const stats = await profileService.getSummary("user-1");
      expect(stats.currentStreak).toBe(3);
    });

    it("should handle broken streaks", async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const mockSessions = [
        { endedAt: today, questions: [] },
        { endedAt: threeDaysAgo, questions: [] }
      ];

      (prisma.user.findUnique as any).mockResolvedValue({ createdAt: new Date() });
      (prisma.interviewSession.findMany as any).mockResolvedValue(mockSessions);

      const stats = await profileService.getSummary("user-1");
      // Current streak is just 1 (today)
      expect(stats.currentStreak).toBe(1);
    });
  });
});
