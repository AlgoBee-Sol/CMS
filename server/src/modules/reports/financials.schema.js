// =============================================================================
// Financials Validation Schemas (Zod)
// =============================================================================

import { z } from "zod";

export const getMonthlyRevenueSchema = z.object({
  query: z.object({
    year: z
      .string()
      .regex(/^\d{4}$/, "Invalid year format")
      .optional(),
  }),
});

export const getClinicPaymentHistorySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    clinicId: z.string().uuid("Invalid clinic ID"),
    amount: z.number().positive("Amount must be positive"),
    paymentMethod: z.enum(["Bank Transfer", "Cash", "Check", "Card"]),
    description: z.string().optional(),
  }),
});

export const getPaymentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    clinicId: z.string().optional(),
    paymentMethod: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
