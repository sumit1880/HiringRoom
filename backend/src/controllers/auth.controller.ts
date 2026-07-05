import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { registerSchema } from "../validators/auth.validator.js";
import { registerUser } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";
import { loginUser } from "../services/auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);

  const user = await registerUser(body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
}); 

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);

  const result = await loginUser(body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});