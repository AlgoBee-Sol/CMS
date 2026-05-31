// =============================================================================
// Request Logger Middleware — morgan
// =============================================================================

import morgan from "morgan";

/**
 * HTTP request logger.
 * Uses 'dev' format in development, 'combined' in production.
 */
export const requestLogger = morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev",
);
