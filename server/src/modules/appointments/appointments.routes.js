// =============================================================================
// Appointments Routes
// =============================================================================

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as appointmentsController from "./appointments.controller.js";
import * as appointmentsSchema from "./appointments.schema.js";

const router = express.Router();

// Create appointment - public endpoint (no auth required, but can be authenticated)
router.post(
  "/",
  validateRequest(appointmentsSchema.createAppointmentSchema),
  asyncHandler(appointmentsController.createAppointment),
);

// Protected routes below - require authentication
router.use(authenticate);

// Get all appointments - requires clinic_owner or reception
router.get(
  "/",
  requireRole("clinic_owner", "reception"),
  validateRequest(appointmentsSchema.getAppointmentsSchema),
  asyncHandler(appointmentsController.getAppointments),
);

// Get single appointment by ID
router.get("/:id", asyncHandler(appointmentsController.getAppointmentById));

// Approve appointment - requires clinic_owner or reception
router.post(
  "/:id/approve",
  requireRole("clinic_owner", "reception"),
  asyncHandler(appointmentsController.approveAppointment),
);

// Reject appointment - requires clinic_owner or reception
router.post(
  "/:id/reject",
  requireRole("clinic_owner", "reception"),
  validateRequest(appointmentsSchema.rejectAppointmentSchema),
  asyncHandler(appointmentsController.rejectAppointment),
);

// Cancel appointment - requires clinic_owner or is own appointment
router.post(
  "/:id/cancel",
  requireRole("clinic_owner", "reception", "patient"),
  asyncHandler(appointmentsController.cancelAppointment),
);

export default router;
