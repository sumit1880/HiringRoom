import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { googleAuthSchema } from "../validators/auth.validator.js";
import { authenticateWithGoogle } from "../services/auth.service.js";

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const body = googleAuthSchema.parse(req.body);

  const result = await authenticateWithGoogle(body);

  res.status(200).json({
    success: true,
    message: "Signed in with Google",
    data: result,
  });
});