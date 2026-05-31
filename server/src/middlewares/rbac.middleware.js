// =============================================================================
// RBAC Middleware — Role-Based Access Control
// =============================================================================

import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

/**
 * Returns middleware that checks if the authenticated user's role
 * is in the list of allowed roles.
 *
 * @param  {...string} allowedRoles - e.g. "OWNER", "DOCTOR", "RECEPTION", "PATIENT"
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post("/sessions", authenticate, requireRole("OWNER", "DOCTOR"), controller);
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userRole = req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
}
