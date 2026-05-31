import { z } from "zod";

export const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, "CNIC must be in format XXXXX-XXXXXXX-X")
    .optional()
    .or(z.literal("")),
});

export type OwnerDto = z.infer<typeof ownerSchema>;
