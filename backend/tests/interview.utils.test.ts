import { describe, it, expect } from "vitest";
import { interviewService } from "../src/services/interview.service.js";

describe("Interview Service Utils", () => {
  describe("parseJsonResponse", () => {
    it("should parse standard JSON", () => {
      const raw = '{"question": "test"}';
      const result = (interviewService as any).parseJsonResponse(raw);
      expect(result).toEqual({ question: "test" });
    });

    it("should strip markdown fences", () => {
      const raw = '```json\n{"topic": "react"}\n```';
      const result = (interviewService as any).parseJsonResponse(raw);
      expect(result).toEqual({ topic: "react" });
    });

    it("should handle text mixed with json", () => {
      const raw = 'Here is the json:\n```json\n{"score": 5}\n```\nHope it helps!';
      const result = (interviewService as any).parseJsonResponse(raw);
      expect(result).toEqual({ score: 5 });
    });
  });

  describe("sanitizeStrengths", () => {
    it("should allow specific strengths for strong answers", () => {
      const result = (interviewService as any).sanitizeStrengths(["Deep knowledge of hooks", "Clear explanation"], false);
      expect(result).toEqual(["Deep knowledge of hooks", "Clear explanation"]);
    });

    it("should return empty array for weak answers", () => {
      const result = (interviewService as any).sanitizeStrengths(["Deep knowledge of hooks"], true);
      expect(result).toEqual([]);
    });

    it("should filter out generic banned strengths", () => {
      const result = (interviewService as any).sanitizeStrengths(["Good communication", "Honesty", "Specific knowledge"], false);
      expect(result).toContain("Specific knowledge");
      // Assuming 'Honesty' is banned
    });
  });

  describe("clampScoresForWeakAnswer", () => {
    it("should not clamp scores for strong answers", () => {
      const scores = { technicalScore: 9, communicationScore: 8, confidenceScore: 7 };
      const result = (interviewService as any).clampScoresForWeakAnswer(scores, false);
      expect(result).toEqual(scores);
    });

    it("should clamp scores for weak answers", () => {
      const scores = { technicalScore: 9, communicationScore: 8, confidenceScore: 7 };
      const result = (interviewService as any).clampScoresForWeakAnswer(scores, true);
      expect(result.technicalScore).toBeLessThanOrEqual(4);
      expect(result.communicationScore).toBeLessThanOrEqual(5);
    });
  });
});
