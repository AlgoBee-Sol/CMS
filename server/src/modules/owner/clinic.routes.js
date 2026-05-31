// =============================================================================
// Clinic Management Routes
// =============================================================================

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as clinicController from "./clinic.controller.js";
import * as clinicSchema from "./clinic.schema.js";

const router = express.Router();

// All clinic management routes require Super Admin authentication
router.use(authenticate);
router.use(requireRole("superAdmin"));

// Create clinic
router.post(
  "/",
  validateRequest(clinicSchema.createClinicSchema),
  asyncHandler(clinicController.createClinic),
);

// Get all clinics
router.get(
  "/",
  validateRequest(clinicSchema.getClinicsSchema),
  asyncHandler(clinicController.getClinics),
);

// Get clinic by ID
router.get("/:id", asyncHandler(clinicController.getClinicById));

// Update clinic
router.patch(
  "/:id",
  validateRequest(clinicSchema.updateClinicSchema),
  asyncHandler(clinicController.updateClinic),
);

// Soft delete clinic
router.delete("/:id", asyncHandler(clinicController.deleteClinic));

// Restore clinic
router.post("/:id/restore", asyncHandler(clinicController.restoreClinic));

// Clinic owner management
router.get("/:id/owner", asyncHandler(clinicController.getClinicOwner));
router.patch("/:id/owner", asyncHandler(clinicController.updateClinicOwner));

// Clinic subscription management
router.patch("/:id/subscription", asyncHandler(clinicController.updateClinicSubscription));

export default router;
