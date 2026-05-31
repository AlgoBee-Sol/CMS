// =============================================================================
// Sessions Controller
// Handles clinical session creation, updates, and management
// =============================================================================

import { prisma } from "../../config/db.config.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/errors.js";

/**
 * Create a new session
 * Only clinic_owner and doctor roles can create sessions
 * Updates session stats for patient (Done/Remaining counts)
 */
export async function createSession(req, res) {
  const {
    patientId,
    doctorId,
    sessionDate,
    sessionTime,
    treatmentTypes,
    durationMinutes,
    clinicalNotes,
    amountPaid,
    paymentMethod,
  } = req.body;

  const { clinicId } = req.user;

  // Validate required fields
  if (
    !patientId ||
    !doctorId ||
    !sessionDate ||
    !sessionTime ||
    !durationMinutes
  ) {
    throw new BadRequestError("Missing required fields");
  }

  // Verify patient belongs to clinic
  const patient = await prisma.user.findFirst({
    where: { id: patientId, clinicId, role: "patient" },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found in this clinic");
  }

  // Verify doctor belongs to clinic
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, clinicId, role: "doctor" },
  });

  if (!doctor) {
    throw new NotFoundError("Doctor not found in this clinic");
  }

  // Use transaction to ensure atomicity
  const session = await prisma.$transaction(async (tx) => {
    // Create session
    const newSession = await tx.session.create({
      data: {
        clinicId,
        patientId,
        doctorId,
        sessionDate: new Date(sessionDate),
        sessionTime,
        treatmentTypes: treatmentTypes || [],
        durationMinutes,
        clinicalNotes: clinicalNotes || null,
        status: "Completed", // Sessions are marked completed on creation
      },
      include: {
        patient: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });

    // Update or create session stats
    const stats = await tx.sessionStats.upsert({
      where: { clinicId_patientId: { clinicId, patientId } },
      update: {
        completedCount: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        clinicId,
        patientId,
        completedCount: 1,
        remainingCount: 0,
        totalPlanned: 1,
      },
    });

    // Create payment record if amount is provided
    if (amountPaid) {
      await tx.sessionPayment.create({
        data: {
          sessionId: newSession.id,
          userId: patientId,
          amountPaid,
          paymentMethod: paymentMethod || "Cash",
        },
      });
    }

    return newSession;
  });

  return res.status(201).json({
    success: true,
    data: {
      session: {
        id: session.id,
        patientName: `${session.patient.firstName} ${session.patient.lastName}`,
        doctorName: `${session.doctor.firstName} ${session.doctor.lastName}`,
        sessionDate: session.sessionDate,
        sessionTime: session.sessionTime,
        treatmentTypes: session.treatmentTypes,
        durationMinutes: session.durationMinutes,
        status: session.status,
        createdAt: session.createdAt,
      },
    },
  });
}

/**
 * Get sessions for a clinic (paginated)
 * Requires clinic_owner or doctor roles
 */
export async function getSessions(req, res) {
  const { clinicId } = req.user;
  const {
    page = "1",
    limit = "10",
    patientId,
    doctorId,
    status,
    from,
    to,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  // Build where clause
  const where = { clinicId };

  if (patientId) {
    where.patientId = patientId;
  }

  if (doctorId) {
    where.doctorId = doctorId;
  }

  if (status) {
    where.status = status;
  }

  if (from || to) {
    where.sessionDate = {};
    if (from) {
      where.sessionDate.gte = new Date(from);
    }
    if (to) {
      where.sessionDate.lte = new Date(to);
    }
  }

  // Fetch sessions and total count
  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffCode: true,
          },
        },
        payments: { select: { amountPaid: true, paymentMethod: true } },
      },
      skip,
      take: pageSize,
      orderBy: { sessionDate: "desc" },
    }),
    prisma.session.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    data: {
      sessions: sessions.map((s) => ({
        id: s.id,
        patient: s.patient,
        doctor: s.doctor,
        sessionDate: s.sessionDate,
        sessionTime: s.sessionTime,
        treatmentTypes: s.treatmentTypes,
        durationMinutes: s.durationMinutes,
        status: s.status,
        totalPayment: s.payments.reduce((sum, p) => sum + p.amountPaid, 0),
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
 * Get a single session by ID
 */
export async function getSessionById(req, res) {
  const { id } = req.params;
  const { clinicId } = req.user;

  const session = await prisma.session.findFirst({
    where: { id, clinicId },
    include: {
      patient: true,
      doctor: true,
      payments: true,
    },
  });

  if (!session) {
    throw new NotFoundError("Session not found");
  }

  return res.json({
    success: true,
    data: { session },
  });
}

/**
 * Update session details
 * Only clinic owner can update, or doctor who created it
 */
export async function updateSession(req, res) {
  const { id } = req.params;
  const { clinicId, userId, role } = req.user;
  const { clinicalNotes, status, durationMinutes } = req.body;

  const session = await prisma.session.findFirst({
    where: { id, clinicId },
  });

  if (!session) {
    throw new NotFoundError("Session not found");
  }

  // Only clinic owner or the doctor who created it can update
  if (role !== "clinic_owner" && session.doctorId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to update this session",
    );
  }

  const updated = await prisma.session.update({
    where: { id },
    data: {
      ...(clinicalNotes !== undefined && { clinicalNotes }),
      ...(status !== undefined && { status }),
      ...(durationMinutes !== undefined && { durationMinutes }),
      updatedAt: new Date(),
    },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      doctor: { select: { firstName: true, lastName: true } },
      payments: true,
    },
  });

  return res.json({
    success: true,
    data: { session: updated },
  });
}

/**
 * Cancel a session
 */
export async function cancelSession(req, res) {
  const { id } = req.params;
  const { clinicId } = req.user;
  const { reason } = req.body;

  const session = await prisma.session.findFirst({
    where: { id, clinicId },
  });

  if (!session) {
    throw new NotFoundError("Session not found");
  }

  // Transaction to update session and stats
  const updated = await prisma.$transaction(async (tx) => {
    const cancelledSession = await tx.session.update({
      where: { id },
      data: { status: "Cancelled" },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });

    // Decrement completed count if it was completed
    if (session.status === "Completed") {
      await tx.sessionStats.update({
        where: {
          clinicId_patientId: { clinicId, patientId: session.patientId },
        },
        data: { completedCount: { decrement: 1 } },
      });
    }

    return cancelledSession;
  });

  return res.json({
    success: true,
    data: {
      message: "Session cancelled successfully",
      session: updated,
    },
  });
}
