// =============================================================================
// Appointments Validation Schemas (Zod)
// =============================================================================

import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: z.string().uuid("Invalid patient ID"),
    clinicId: z.string().uuid("Invalid clinic ID"),
    requestedDate: z.string().datetime("Invalid requested date"),
    preferredTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)",
      ),
    chiefComplaint: z.string().min(1, "Chief complaint is required").max(500),
    notes: z.string().optional(),
  }),
});

export const getAppointmentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z
      .enum(["Pending", "Approved", "Rejected", "Completed", "Cancelled"])
      .optional(),
    patientId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const rejectAppointmentSchema = z.object({
  body: z.object({
    rejectionReason: z.string().min(1, "Rejection reason is required").max(500),
  }),
});
