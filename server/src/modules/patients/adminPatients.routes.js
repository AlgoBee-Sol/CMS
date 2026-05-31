// =============================================================================
// Admin Patients Routes
// =============================================================================

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as patientsController from "./patients.controller.js";
import * as patientsSchema from "./patients.schema.js";

const router = express.Router();

// Require Super Admin authentication
router.use(authenticate);
router.use(requireRole("superAdmin"));

// Get all patients globally
router.get(
  "/",
  validateRequest(patientsSchema.getPatientsAdminSchema),
  asyncHandler(patientsController.getPatientsAdmin),
);

export default router;
