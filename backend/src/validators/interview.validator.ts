import { z } from "zod";

export const createInterviewSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),

  type: z.enum([
    "DSA",
    "BEHAVIORAL",
    "SYSTEM_DESIGN",
    "CASE_STUDY",
  ]),

  difficulty: z
    .enum(["easy", "medium", "hard"])
    .default("medium"),

  resumeId: z
    .string()
    .trim()
    .min(1, "resumeId is required"),

  durationMinutes: z
    .union([
      z.literal(15),
      z.literal(30),
      z.literal(45),
      z.literal(60),
    ])
    .default(30),
});