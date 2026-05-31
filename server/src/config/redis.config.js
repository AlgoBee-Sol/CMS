// =============================================================================
// Redis Client Singleton — ioredis
// =============================================================================

import Redis from "ioredis";
import { env } from "./env.config.js";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

/**
 * Initialize the Redis connection.
 * Call this during server startup.
 */
export async function connectRedis() {
  try {
    await redis.connect();
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err.message);
    // Non-fatal: server can still operate without Redis for caching
    // but refresh token blacklisting will degrade to DB-only
  }
}

export default redis;
