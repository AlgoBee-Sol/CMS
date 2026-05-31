// =============================================================================
// Clinic Management Controller
// Super Admin CRUD operations for clinics
// =============================================================================

import { prisma } from "../../config/db.config.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";

/**
 * Create a new clinic
 * Only Super Admin can create clinics
 */
export async function createClinic(req, res) {
  const {
    code,
    name,
    subdomain,
    email,
    phone,
    address,
    logoUrl,
    termsAndConditions,
  } = req.body;

  if (!code || !name || !subdomain || !email || !phone) {
    throw new BadRequestError("Missing required fields");
  }

  // Check if code or subdomain already exist
  const existing = await prisma.clinic.findFirst({
    where: {
      OR: [{ code }, { subdomain }],
      isDeleted: false,
    },
  });

  if (existing) {
    throw new ConflictError("Clinic code or subdomain already exists");
  }

  const clinic = await prisma.clinic.create({
    data: {
      code: code.toUpperCase(),
      name,
      subdomain: subdomain.toLowerCase(),
      email,
      phone,
      address: address || null,
      logoUrl: logoUrl || null,
      termsAndConditions: termsAndConditions || null,
    },
  });

  // Create default subscription
  await prisma.subscription.create({
    data: {
      clinicId: clinic.id,
      status: "Trial",
      planType: "Trial",
      amount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return res.status(201).json({
    success: true,
    data: { clinic },
  });
}

/**
 * Get all clinics
 * Super Admin endpoint with optional filtering
 */
export async function getClinics(req, res) {
  const { page = "1", limit = "10", search, isDeleted = "false" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  const where = {
    isDeleted: isDeleted === "true",
  };

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { subdomain: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [clinics, total] = await Promise.all([
    prisma.clinic.findMany({
      where,
      include: {
        subscription: true,
        _count: { select: { users: true, appointments: true, sessions: true } },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.clinic.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    data: {
      clinics: clinics.map((c) => ({
        ...c,
        userCount: c._count.users,
        appointmentCount: c._count.appointments,
        sessionCount: c._count.sessions,
        _count: undefined,
      })),
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
      },
    },
  });
}

/**
 * Get clinic by ID with detailed info
 */
export async function getClinicById(req, res) {
  const { id } = req.params;

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      subscription: true,
      payments: { orderBy: { paymentDate: "desc" } },
      _count: { select: { users: true, appointments: true, sessions: true } },
    },
  });

  if (!clinic) {
    throw new NotFoundError("Clinic not found");
  }

  return res.json({
    success: true,
    data: {
      clinic: {
        ...clinic,
        userCount: clinic._count.users,
        appointmentCount: clinic._count.appointments,
        sessionCount: clinic._count.sessions,
        _count: undefined,
      },
    },
  });
}

/**
 * Update clinic details
 * Super Admin only
 */
export async function updateClinic(req, res) {
  const { id } = req.params;
  const { name, email, phone, address, logoUrl, termsAndConditions } = req.body;

  const clinic = await prisma.clinic.findUnique({ where: { id } });

  if (!clinic) {
    throw new NotFoundError("Clinic not found");
  }

  const updated = await prisma.clinic.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address !== undefined && { address }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(termsAndConditions !== undefined && { termsAndConditions }),
    },
    include: { subscription: true },
  });

  return res.json({
    success: true,
    data: { clinic: updated },
  });
}

/**
 * Soft delete a clinic
 * Sets isDeleted flag and records who deleted it
 */
export async function deleteClinic(req, res) {
  const { id } = req.params;
  const { superAdminId } = req.user; // Passed from auth middleware for super admin

  const clinic = await prisma.clinic.findUnique({ where: { id } });

  if (!clinic) {
    throw new NotFoundError("Clinic not found");
  }

  if (clinic.isDeleted) {
    throw new BadRequestError("Clinic is already deleted");
  }

  const deleted = await prisma.clinic.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: superAdminId,
    },
  });

  return res.json({
    success: true,
    data: {
      message: "Clinic soft-deleted successfully",
      clinic: deleted,
    },
  });
}

/**
 * Restore a soft-deleted clinic
 */
export async function restoreClinic(req, res) {
  const { id } = req.params;

  const clinic = await prisma.clinic.findUnique({ where: { id } });

  if (!clinic) {
    throw new NotFoundError("Clinic not found");
  }

  if (!clinic.isDeleted) {
    throw new BadRequestError("Clinic is not deleted");
  }

  const restored = await prisma.clinic.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    },
    include: { subscription: true },
  });

  return res.json({
    success: true,
    data: {
      message: "Clinic restored successfully",
      clinic: restored,
    },
  });
}
