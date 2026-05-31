// =============================================================================
// Authentication Routes
// =============================================================================

import express from "express";
import * as authController from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import * as authSchema from "./auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = express.Router();

// Public routes
router.post(
  "/login",
  validateRequest(authSchema.loginSchema),
  asyncHandler(authController.login),
);
router.post(
  "/register",
  validateRequest(authSchema.registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/refresh-token",
  validateRequest(authSchema.refreshTokenSchema),
  asyncHandler(authController.refreshToken),
);

// Protected routes
router.post("/logout", authenticate, asyncHandler(authController.logout));

export default router;
