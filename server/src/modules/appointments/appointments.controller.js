// =============================================================================
// Appointments Controller
// Handles appointment requests, approvals, and management
// =============================================================================

import { prisma } from "../../config/db.config.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/errors.js";

/**
 * Create appointment request
 * Can be done by patient or public (without auth)
 */
export async function createAppointment(req, res) {
  const { patientId, requestedDate, preferredTime, chiefComplaint, clinicId } =
    req.body;

  if (
    !patientId ||
    !requestedDate ||
    !preferredTime ||
    !chiefComplaint ||
    !clinicId
  ) {
    throw new BadRequestError("Missing required fields");
  }

  // Verify patient exists
  const patient = await prisma.user.findFirst({
    where: { id: patientId, clinicId, role: "patient" },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      clinicId,
      patientId,
      requestedDate: new Date(requestedDate),
      preferredTime,
      chiefComplaint,
      status: "Pending",
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      appointment: {
        id: appointment.id,
        patient: appointment.patient,
        requestedDate: appointment.requestedDate,
        preferredTime: appointment.preferredTime,
        chiefComplaint: appointment.chiefComplaint,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
    },
  });
}

/**
 * Get appointments for a clinic
 * Requires clinic_owner or reception roles
 */
export async function getAppointments(req, res) {
  const { clinicId } = req.user;
  const { page = "1", limit = "10", status, patientId, from, to } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  // Build where clause
  const where = { clinicId };

  if (status) {
    where.status = status;
  }

  if (patientId) {
    where.patientId = patientId;
  }

  if (from || to) {
    where.requestedDate = {};
    if (from) {
      where.requestedDate.gte = new Date(from);
    }
    if (to) {
      where.requestedDate.lte = new Date(to);
    }
  }

  // Fetch appointments and total
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: { firstName: true, lastName: true, staffCode: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { requestedDate: "asc" },
    }),
    prisma.appointment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    data: {
      appointments: appointments.map((a) => ({
        id: a.id,
        patient: a.patient,
        requestedDate: a.requestedDate,
        preferredTime: a.preferredTime,
        chiefComplaint: a.chiefComplaint,
        status: a.status,
        approvedBy: a.approver
          ? `${a.approver.firstName} ${a.approver.lastName}`
          : null,
        createdAt: a.createdAt,
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
 * Get single appointment by ID
 */
export async function getAppointmentById(req, res) {
  const { id } = req.params;
  const { clinicId } = req.user;

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: {
      patient: true,
      approver: {
        select: { firstName: true, lastName: true, staffCode: true },
      },
    },
  });

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  return res.json({
    success: true,
    data: { appointment },
  });
}

/**
 * Approve appointment
 * Only clinic_owner and reception roles can approve
 */
export async function approveAppointment(req, res) {
  const { id } = req.params;
  const { clinicId, userId, role } = req.user;

  if (!["clinic_owner", "reception"].includes(role)) {
    throw new ForbiddenError(
      "Only clinic owner or reception can approve appointments",
    );
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
  });

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  if (appointment.status !== "Pending") {
    throw new BadRequestError(
      `Cannot approve ${appointment.status.toLowerCase()} appointment`,
    );
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: "Approved",
      approvedBy: userId,
      updatedAt: new Date(),
    },
    include: {
      patient: { select: { firstName: true, lastName: true, email: true } },
      approver: { select: { firstName: true, lastName: true } },
    },
  });

  return res.json({
    success: true,
    data: {
      appointment: updated,
      message: "Appointment approved successfully",
    },
  });
}

/**
 * Reject appointment
 * Only clinic_owner and reception roles can reject
 */
export async function rejectAppointment(req, res) {
  const { id } = req.params;
  const { clinicId, userId, role } = req.user;
  const { rejectionReason } = req.body;

  if (!["clinic_owner", "reception"].includes(role)) {
    throw new ForbiddenError(
      "Only clinic owner or reception can reject appointments",
    );
  }

  if (!rejectionReason) {
    throw new BadRequestError("Rejection reason is required");
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
  });

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  if (appointment.status !== "Pending") {
    throw new BadRequestError(
      `Cannot reject ${appointment.status.toLowerCase()} appointment`,
    );
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: "Rejected",
      rejectionReason,
      approvedBy: userId, // Track who rejected it
      updatedAt: new Date(),
    },
    include: {
      patient: { select: { firstName: true, lastName: true, email: true } },
      approver: { select: { firstName: true, lastName: true } },
    },
  });

  return res.json({
    success: true,
    data: {
      appointment: updated,
      message: "Appointment rejected successfully",
    },
  });
}

/**
 * Cancel appointment
 * Clinic owner can cancel, or patient can cancel their own
 */
export async function cancelAppointment(req, res) {
  const { id } = req.params;
  const { clinicId, userId, role } = req.user;

  const appointment = await prisma.appointment.findFirst({
    where: { id, clinicId },
  });

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  // Only clinic owner or patient can cancel
  if (role !== "clinic_owner" && appointment.patientId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to cancel this appointment",
    );
  }

  if (appointment.status === "Cancelled") {
    throw new BadRequestError("Appointment is already cancelled");
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: "Cancelled",
      updatedAt: new Date(),
    },
    include: {
      patient: { select: { firstName: true, lastName: true } },
    },
  });

  return res.json({
    success: true,
    data: {
      appointment: updated,
      message: "Appointment cancelled successfully",
    },
  });
}
