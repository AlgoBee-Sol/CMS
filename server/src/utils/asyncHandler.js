// =============================================================================
// Async Handler — Wraps async route handlers to forward errors
// =============================================================================

/**
 * Wraps an async Express route handler so that any rejected promise
 * is automatically forwarded to the Express error-handling middleware.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
