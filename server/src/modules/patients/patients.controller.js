// =============================================================================
// Patients Controller
// Handles patient management and retrieval
// =============================================================================

import { prisma } from "../../config/db.config.js";
import { encrypt, decrypt } from "../../utils/encryption.util.js";
import { NotFoundError } from "../../utils/errors.js";

/**
 * Get all patients for a clinic
 * Requires clinic_owner or reception roles
 * Returns paginated patient list with isolation enforced
 */
export async function getPatients(req, res) {
  const { clinicId } = req.user;
  const { page = "1", limit = "10", search } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  // Build where clause
  const where = {
    clinicId,
    role: "patient",
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fetch patients and total count
  const [patients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cnic: true, // encrypted
        isActive: true,
        createdAt: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Decrypt CNIC for display
  const decryptedPatients = patients.map((p) => ({
    ...p,
    cnic: p.cnic ? decrypt(p.cnic) : null,
  }));

  return res.json({
    success: true,
    data: {
      patients: decryptedPatients,
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
 * Get patient by ID with session history and stats
 */
export async function getPatientById(req, res) {
  const { id } = req.params;
  const { clinicId } = req.user;

  const patient = await prisma.user.findFirst({
    where: { id, clinicId, role: "patient" },
    include: {
      patientSessions: {
        include: {
          doctor: {
            select: { firstName: true, lastName: true, staffCode: true },
          },
          payments: true,
        },
        orderBy: { sessionDate: "desc" },
        take: 10, // Last 10 sessions
      },
      appointments: {
        orderBy: { requestedDate: "desc" },
        take: 5, // Last 5 appointments
      },
    },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  // Get session stats
  const stats = await prisma.sessionStats.findUnique({
    where: { clinicId_patientId: { clinicId, patientId: id } },
  });

  // Decrypt CNIC
  const decryptedPatient = {
    ...patient,
    cnic: patient.cnic ? decrypt(patient.cnic) : null,
  };

  return res.json({
    success: true,
    data: {
      patient: decryptedPatient,
      stats: stats || { completedCount: 0, remainingCount: 0, totalPlanned: 0 },
    },
  });
}

/**
 * Get patient session history (paginated)
 */
export async function getPatientSessions(req, res) {
  const { patientId } = req.params;
  const { clinicId } = req.user;
  const { page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * pageSize;

  // Verify patient exists
  const patient = await prisma.user.findFirst({
    where: { id: patientId, clinicId, role: "patient" },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  // Fetch sessions
  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where: {
        patientId,
        clinicId,
      },
      include: {
        doctor: {
          select: { firstName: true, lastName: true, staffCode: true },
        },
        payments: true,
      },
      skip,
      take: pageSize,
      orderBy: { sessionDate: "desc" },
    }),
    prisma.session.count({ where: { patientId, clinicId } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    data: {
      sessions: sessions.map((s) => ({
        id: s.id,
        doctorName: `${s.doctor.firstName} ${s.doctor.lastName}`,
        sessionDate: s.sessionDate,
        sessionTime: s.sessionTime,
        treatmentTypes: s.treatmentTypes,
        status: s.status,
        totalPayment: s.payments.reduce((sum, p) => sum + p.amountPaid, 0),
        createdAt: s.createdAt,
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
 * Update patient profile
 */
export async function updatePatient(req, res) {
  const { id } = req.params;
  const { clinicId } = req.user;
  const { firstName, lastName, phone, cnic } = req.body;

  const patient = await prisma.user.findFirst({
    where: { id, clinicId, role: "patient" },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  // Encrypt CNIC if provided
  let encryptedCnic;
  if (cnic !== undefined) {
    encryptedCnic = cnic ? encrypt(cnic) : null;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(cnic !== undefined && { cnic: encryptedCnic }),
    },
  });

  // Decrypt for response
  const decryptedPatient = {
    ...updated,
    cnic: updated.cnic ? decrypt(updated.cnic) : null,
  };

  return res.json({
    success: true,
    data: { patient: decryptedPatient },
  });
}

/**
 * Get patient statistics
 */
export async function getPatientStats(req, res) {
  const { patientId } = req.params;
  const { clinicId } = req.user;

  // Verify patient exists
  const patient = await prisma.user.findFirst({
    where: { id: patientId, clinicId, role: "patient" },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  // Get session stats
  const stats = await prisma.sessionStats.findUnique({
    where: { clinicId_patientId: { clinicId, patientId } },
  });

  // Get appointment counts
  const appointmentCounts = await prisma.appointment.groupBy({
    by: ["status"],
    where: { patientId, clinicId },
    _count: true,
  });

  // Get total payments
  const totalPayments = await prisma.sessionPayment.aggregate({
    where: {
      userId: patientId,
      session: { clinicId },
    },
    _sum: { amountPaid: true },
  });

  return res.json({
    success: true,
    data: {
      sessions: {
        completed: stats?.completedCount || 0,
        remaining: stats?.remainingCount || 0,
        total: stats?.totalPlanned || 0,
      },
      appointments: appointmentCounts.reduce(
        (acc, { status, _count }) => ({
          ...acc,
          [status.toLowerCase()]: _count,
        }),
        {},
      ),
      totalPaymentsMade: totalPayments._sum.amountPaid || 0,
    },
  });
}
