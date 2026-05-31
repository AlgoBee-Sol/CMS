// =============================================================================
// Environment validation and loading — dotenv + Zod
// =============================================================================

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
  BACKEND_PORT: z.string().default("4000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT secrets
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  // Encryption (64-char hex = 32 bytes for AES-256)
  ENCRYPTION_KEY: z
    .string()
    .length(64, "ENCRYPTION_KEY must be a 64-char hex string"),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
