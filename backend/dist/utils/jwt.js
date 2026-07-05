import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function generateToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "7d",
    });
}
