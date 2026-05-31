// =============================================================================
// Prisma Client Singleton — using @prisma/adapter-pg + pg Pool
// =============================================================================

import prismaPkg from "@prisma/client";
const { PrismaClient } = prismaPkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env.config.js";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["warn", "error"],
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

export default prisma;
