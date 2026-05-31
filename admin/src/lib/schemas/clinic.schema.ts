import { z } from "zod";

export const createClinicSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(5, "Code must be at most 5 characters"),
  name: z.string().min(1, "Clinic name is required"),
  subdomain: z
    .string()
    .min(1, "Subdomain is required")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  termsAndConditions: z.string().optional(),
});

export const updateClinicSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  termsAndConditions: z.string().optional(),
});

export type CreateClinicDto = z.infer<typeof createClinicSchema>;
export type UpdateClinicDto = z.infer<typeof updateClinicSchema>;
