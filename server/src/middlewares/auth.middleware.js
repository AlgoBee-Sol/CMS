// =============================================================================
// JWT Authentication Middleware
// =============================================================================

import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 *
 * On success, attaches to req.user:
 *   { userId, clinicId, role, userType }
 *
 * userType is one of: "staff" | "patient" | "superAdmin"
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed authorization header");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    req.user = {
      userId: payload.userId,
      clinicId: payload.clinicId || null,
      role: payload.role || null,
      userType: payload.userType, // "staff" | "patient" | "superAdmin"
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Access token has expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}
