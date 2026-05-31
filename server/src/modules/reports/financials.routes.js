// =============================================================================
// Financials Routes
// Super Admin financial reporting and analytics
// =============================================================================

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as financialsController from "./financials.controller.js";
import * as financialsSchema from "./financials.schema.js";

const router = express.Router();

// All financial routes require Super Admin authentication
router.use(authenticate);
router.use(requireRole("superAdmin"));

// Get dashboard summary
router.get(
  "/dashboard/summary",
  asyncHandler(financialsController.getDashboardSummary),
);

// Get monthly revenue
router.get(
  "/revenue/monthly",
  validateRequest(financialsSchema.getMonthlyRevenueSchema),
  asyncHandler(financialsController.getMonthlyRevenue),
);

// Get yearly revenue with growth
router.get(
  "/revenue/yearly",
  asyncHandler(financialsController.getYearlyRevenue),
);

// Get subscription analytics
router.get(
  "/subscriptions/analytics",
  asyncHandler(financialsController.getSubscriptionAnalytics),
);

// Get clinic payment history
router.get(
  "/clinics/:clinicId/payments",
  validateRequest(financialsSchema.getClinicPaymentHistorySchema),
  asyncHandler(financialsController.getClinicPaymentHistory),
);

// Record a payment
router.post(
  "/payments",
  validateRequest(financialsSchema.recordPaymentSchema),
  asyncHandler(financialsController.recordPayment),
);

// Get all platform payments (global payment history)
router.get(
  "/payments",
  validateRequest(financialsSchema.getPaymentsSchema),
  asyncHandler(financialsController.getPayments),
);

export default router;
