// =============================================================================
// Express App Configuration
// =============================================================================

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import sessionsRoutes from "./modules/sessions/sessions.routes.js";
import appointmentsRoutes from "./modules/appointments/appointments.routes.js";
import patientsRoutes from "./modules/patients/patients.routes.js";
import clinicRoutes from "./modules/owner/clinic.routes.js";
import financialsRoutes from "./modules/reports/financials.routes.js";
import adminPatientsRoutes from "./modules/patients/adminPatients.routes.js";

// Import middleware
import { tenantIsolation } from "./middlewares/tenantIsolation.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

// ============================================================================
// Global Middleware
// ============================================================================

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

// Logging
app.use(morgan("combined"));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// ============================================================================
// API Routes
// ============================================================================

// Auth routes (public)
app.use("/api/auth", authRoutes);

// Tenant isolation middleware for clinic routes
app.use("/api", tenantIsolation);

// Clinic user routes
app.use("/api/sessions", sessionsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/patients", patientsRoutes);

// Super Admin routes
app.use("/api/admin/clinics", clinicRoutes);
app.use("/api/admin/financials", financialsRoutes);
app.use("/api/admin/patients", adminPatientsRoutes);

// ============================================================================
// 404 Handler
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// ============================================================================
// Error Handler (must be last)
// ============================================================================

app.use(errorHandler);

export default app;
