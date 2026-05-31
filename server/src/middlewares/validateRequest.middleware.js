// =============================================================================
// Request Validation Middleware
// Validates request body, query, and params against Zod schemas
// =============================================================================

import { ValidationError } from "../utils/errors.js";

/**
 * Creates middleware that validates request data against a Zod schema
 * Schema object should have: body, query, params (optional)
 *
 * @param {object} schema - Zod schema with body, query, params shape
 * @returns {Function} Express middleware
 *
 * @example
 *   const schema = z.object({
 *     body: z.object({ email: z.string().email() }),
 *     query: z.object({ page: z.string().optional() }),
 *   });
 *   router.post("/users", validateRequest(schema), controller);
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // Prepare validation object
      const toValidate = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      };

      // Validate
      const result = schema.safeParse(toValidate);

      if (!result.success) {
        // Format errors
        const errors = Object.entries(result.error.format()).reduce(
          (acc, [key, value]) => {
            if (value && "_errors" in value) {
              acc[key] = value._errors;
            } else {
              // Flatten nested errors
              Object.entries(value || {}).forEach(([field, err]) => {
                if (err && "_errors" in err) {
                  acc[`${key}.${field}`] = err._errors;
                }
              });
            }
            return acc;
          },
          {},
        );

        throw new ValidationError("Validation failed", errors);
      }

      // Validated data
      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;

      next();
    } catch (error) {
      next(error);
    }
  };
}
