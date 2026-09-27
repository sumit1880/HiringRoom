import { describe, it, expect } from "vitest";
import { createInterviewSchema } from "../src/validators/interview.validator.js";

describe("Interview Validator & Business Logic", () => {
  it("should validate and normalize interview creation config", () => {
    const validConfig = {
      title: "Senior Fullstack Engineer Interview",
      type: "DSA",
      difficulty: "HARD",
      durationMinutes: 45,
      resumeId: "resume-cuid-123456",
    };

    const parsed = createInterviewSchema.safeParse(validConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe("DSA");
      expect(parsed.data.difficulty).toBe("hard");
      expect(parsed.data.durationMinutes).toBe(45);
    }
  });

  it("should handle lowercase difficulty casing normalization", () => {
    const configWithLowercase = {
      title: "Frontend React Developer",
      type: "BEHAVIORAL",
      difficulty: "easy",
      durationMinutes: 30,
      resumeId: "resume-cuid-123456",
    };

    const parsed = createInterviewSchema.safeParse(configWithLowercase);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.difficulty).toBe("easy");
    }
  });

  it("should reject invalid interview type", () => {
    const invalidConfig = {
      title: "Unknown Role",
      type: "NON_EXISTENT_TYPE",
      difficulty: "MEDIUM",
      durationMinutes: 30,
      resumeId: "resume-123",
    };

    const parsed = createInterviewSchema.safeParse(invalidConfig);
    expect(parsed.success).toBe(false);
  });
});
