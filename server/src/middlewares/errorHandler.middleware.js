// =============================================================================
// Global Error Handler Middleware
// =============================================================================

import { AppError, ValidationError } from "../utils/errors.js";

/**
 * Maps known Prisma error codes to user-friendly responses.
 */
const PRISMA_ERROR_MAP = {
  P2002: { statusCode: 409, message: "A record with this value already exists." },
  P2025: { statusCode: 404, message: "Record not found." },
  P2003: { statusCode: 400, message: "Related record not found (foreign key constraint)." },
  P2014: { statusCode: 400, message: "This change would violate a required relation." },
};

/**
 * Express global error handler.
 * Must be registered AFTER all routes with 4 arguments: (err, req, res, next).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // ── Zod validation errors ──
  if (err.name === "ZodError" || err.issues) {
    const formatted = (err.issues || []).map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: formatted,
    });
  }

  // ── Custom AppError subclasses ──
  if (err instanceof AppError) {
    const payload = {
      success: false,
      code: err.code,
      message: err.message,
    };
    if (err instanceof ValidationError && err.errors?.length) {
      payload.errors = err.errors;
    }
    return res.status(err.statusCode).json(payload);
  }

  // ── Prisma known errors ──
  if (err.code && PRISMA_ERROR_MAP[err.code]) {
    const mapped = PRISMA_ERROR_MAP[err.code];
    return res.status(mapped.statusCode).json({
      success: false,
      code: err.code,
      message: mapped.message,
    });
  }

  // ── JWT errors ──
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid token",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      code: "TOKEN_EXPIRED",
      message: "Token has expired",
    });
  }

  // ── Unexpected errors ──
  console.error("❌ Unhandled error:", err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
}
