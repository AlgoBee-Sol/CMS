// =============================================================================
// Patients Validation Schemas (Zod)
// =============================================================================

import { z } from "zod";

export const getPatientsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const getPatientSessionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    cnic: z.string().optional(),
  }),
});
