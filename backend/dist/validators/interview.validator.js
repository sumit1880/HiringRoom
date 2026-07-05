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
    ]),
});
