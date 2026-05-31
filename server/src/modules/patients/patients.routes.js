// =============================================================================
// Patients Routes
// =============================================================================

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as patientsController from "./patients.controller.js";
import * as patientsSchema from "./patients.schema.js";

const router = express.Router();

// All patient routes require authentication
router.use(authenticate);

// Get all patients - requires clinic_owner or reception
router.get(
  "/",
  requireRole("clinic_owner", "reception"),
  validateRequest(patientsSchema.getPatientsSchema),
  asyncHandler(patientsController.getPatients),
);

// Get patient by ID
router.get("/:id", asyncHandler(patientsController.getPatientById));

// Get patient session history
router.get(
  "/:patientId/sessions",
  validateRequest(patientsSchema.getPatientSessionsSchema),
  asyncHandler(patientsController.getPatientSessions),
);

// Get patient statistics
router.get(
  "/:patientId/stats",
  asyncHandler(patientsController.getPatientStats),
);

// Update patient profile
router.patch(
  "/:id",
  requireRole("clinic_owner", "reception", "patient"),
  validateRequest(patientsSchema.updatePatientSchema),
  asyncHandler(patientsController.updatePatient),
);

export default router;
