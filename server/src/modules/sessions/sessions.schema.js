// =============================================================================
// Sessions Validation Schemas (Zod)
// =============================================================================

import { z } from "zod";

export const createSessionSchema = z.object({
  body: z.object({
    patientId: z.string().uuid("Invalid patient ID"),
    doctorId: z.string().uuid("Invalid doctor ID"),
    sessionDate: z.string().datetime("Invalid session date"),
    sessionTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)",
      ),
    treatmentTypes: z.array(z.string()).optional(),
    durationMinutes: z.number().int().positive("Duration must be positive"),
    clinicalNotes: z.string().optional(),
    amountPaid: z.number().positive().optional(),
    paymentMethod: z.enum(["Cash", "Card", "Bank Transfer"]).optional(),
  }),
});

export const getSessionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    status: z.enum(["Pending", "Completed", "Cancelled"]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const updateSessionSchema = z.object({
  body: z.object({
    clinicalNotes: z.string().optional(),
    status: z.enum(["Pending", "Completed", "Cancelled"]).optional(),
    durationMinutes: z.number().int().positive().optional(),
  }),
});

export const cancelSessionSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
