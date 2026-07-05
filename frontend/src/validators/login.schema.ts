import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;