// env validation and loading using dotenv and zod
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
  BACKEND_PORT: z.string().default("4000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
