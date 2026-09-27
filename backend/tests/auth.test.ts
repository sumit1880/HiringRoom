import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema, googleAuthSchema } from "../src/validators/auth.validator.js";
import { generateToken, verifyToken } from "../src/utils/jwt.js";

describe("Auth Validators & Utilities", () => {
  describe("registerSchema", () => {
    it("should accept valid registration payload", () => {
      const valid = {
        name: "Sumit Prakash",
        email: "sumit@example.com",
        password: "securepassword123",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalid = {
        name: "Sumit",
        email: "not-an-email",
        password: "password123",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject short passwords (< 6 chars)", () => {
      const invalid = {
        name: "Sumit",
        email: "sumit@example.com",
        password: "123",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate email and password presence", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "secretpassword",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("googleAuthSchema", () => {
    it("should validate idToken", () => {
      const valid = { idToken: "valid-google-oauth-id-token-12345" };
      expect(googleAuthSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject short idToken", () => {
      expect(googleAuthSchema.safeParse({ idToken: "abc" }).success).toBe(false);
    });
  });

  describe("bcrypt Hashing & Verification", () => {
    it("should properly hash and verify passwords", async () => {
      const rawPassword = "CandidateSecretPass!2026";
      const hash = await bcrypt.hash(rawPassword, 10);

      expect(hash).not.toBe(rawPassword);
      expect(await bcrypt.compare(rawPassword, hash)).toBe(true);
      expect(await bcrypt.compare("WrongPassword", hash)).toBe(false);
    });
  });

  describe("JWT Token Generation & Verification", () => {
    it("should generate and verify JWT payload", () => {
      const payload = { userId: "user-123", email: "user@example.com" };
      const token = generateToken(payload);
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });
});
