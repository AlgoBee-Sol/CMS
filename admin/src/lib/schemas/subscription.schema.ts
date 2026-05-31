import { z } from "zod";

export const subscriptionSchema = z.object({
  status: z.enum(["Active", "Trial"]),
  planType: z.string().min(1, "Plan type is required"),
  amount: z.number().min(0, "Amount must be 0 or more"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  autoRenew: z.boolean().default(true),
});

export const paymentSchema = z.object({
  clinicId: z.string().min(1, "Clinic is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["Bank Transfer", "Cash", "Check", "Card"]),
  description: z.string().optional(),
});

export type SubscriptionDto = z.infer<typeof subscriptionSchema>;
export type PaymentDto = z.infer<typeof paymentSchema>;
