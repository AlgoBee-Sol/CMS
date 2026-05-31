// =============================================================================
// Sessions Routes
// =============================================================================

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as sessionsController from "./sessions.controller.js";
import * as sessionsSchema from "./sessions.schema.js";

const router = express.Router();

// All session routes require authentication
router.use(authenticate);

// Create session - requires clinic_owner or doctor
router.post(
  "/",
  requireRole("clinic_owner", "doctor"),
  validateRequest(sessionsSchema.createSessionSchema),
  asyncHandler(sessionsController.createSession),
);

// Get all sessions - requires clinic_owner or doctor
router.get(
  "/",
  requireRole("clinic_owner", "doctor"),
  validateRequest(sessionsSchema.getSessionsSchema),
  asyncHandler(sessionsController.getSessions),
);

// Get session by ID
router.get("/:id", asyncHandler(sessionsController.getSessionById));

// Update session - requires clinic_owner or doctor
router.patch(
  "/:id",
  requireRole("clinic_owner", "doctor"),
  validateRequest(sessionsSchema.updateSessionSchema),
  asyncHandler(sessionsController.updateSession),
);

// Cancel session - requires clinic_owner
router.post(
  "/:id/cancel",
  requireRole("clinic_owner", "reception"),
  validateRequest(sessionsSchema.cancelSessionSchema),
  asyncHandler(sessionsController.cancelSession),
);

export default router;
