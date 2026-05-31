// =============================================================================
// Auth Validation Schemas (Zod)
// =============================================================================

import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    isClinicUser: z.boolean().optional().default(true),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    cnic: z.string().optional(),
    role: z.enum(["clinic_owner", "reception", "doctor", "patient"], {
      errorMap: () => ({ message: "Invalid role" }),
    }),
    clinicId: z.string().uuid("Invalid clinic ID"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});
