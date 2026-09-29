import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5000),

  DATABASE_URL: requireEnv("DATABASE_URL"),

  JWT_SECRET: requireEnv("JWT_SECRET"),

  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),

  GEMINI_API_KEY: requireEnv("GEMINI_API_KEY"),

  OPENROUTER_API_KEY: requireEnv("OPENROUTER_API_KEY"),

  GROQ_API_KEY: requireEnv("GROQ_API_KEY"),

  // Comma-separated list of allowed frontend origins for CORS, e.g.
  // "https://app.example.com,https://staging.example.com". Falls back to
  // "*" in non-production so local dev keeps working without extra setup —
  // production MUST set this or CORS will reject every browser request.
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // Outbound AI provider HTTP call timeout (ms). Prevents a hung upstream
  // provider from holding a request open indefinitely.
  AI_PROVIDER_TIMEOUT_MS: Number(process.env.AI_PROVIDER_TIMEOUT_MS) || 30_000,
  
  TOP_K: Number(process.env.TOP_K || 5),
  COOLDOWN_MS: Number(process.env.COOLDOWN_MS || 1800000),
  EMBEDDING_CONCURRENCY: Number(process.env.EMBEDDING_CONCURRENCY || 5),
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-flash-latest",
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324",
  GROQ_MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  RESUME_MAX_CHARS: Number(process.env.RESUME_MAX_CHARS || 3000),
};