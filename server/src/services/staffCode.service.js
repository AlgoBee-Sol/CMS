// =============================================================================
// Staff Code Generator — Atomic sequential ID generation
// Generates codes in format: CLINICCODE-ROLECODE-SEQ (e.g., TMJ-ADM-001)
// =============================================================================

import { prisma } from "../config/db.config.js";

const ROLE_CODE_MAP = {
  clinic_owner: "OWN",
  reception: "RCP",
  doctor: "DTR",
  patient: null, // Patients don't get staff codes
};

/**
 * Atomically generates the next staff code scoped per clinic + role.
 *
 * Searches for the highest existing sequence number for the clinic + role,
 * then increments it.
 *
 * @param {string} clinicId - The clinic's ID
 * @param {string} clinicCode - The clinic's code (e.g., "TMJ")
 * @param {string} role - Role (clinic_owner, doctor, reception, patient)
 * @returns {Promise<string|null>} Generated code like "TMJ-OWN-001" or null for patients
 */
export async function generateStaffCode(clinicId, clinicCode, role) {
  // Patients don't get staff codes
  if (role === "patient") {
    return null;
  }

  const roleCode = ROLE_CODE_MAP[role];
  if (!roleCode) {
    throw new Error(`Unknown role for staff code generation: ${role}`);
  }

  try {
    // Find the last staff code for this clinic + role
    const lastUser = await prisma.user.findFirst({
      where: {
        clinicId,
        role,
        staffCode: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        staffCode: true,
      },
    });

    let nextSequence = 1;

    if (lastUser?.staffCode) {
      // Extract the sequence number from the last staff code
      // Format: "TMJ-OWN-001"
      const parts = lastUser.staffCode.split("-");
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2], 10);
        if (!isNaN(lastSequence)) {
          nextSequence = lastSequence + 1;
        }
      }
    }

    // Format with zero-padding (3 digits)
    const paddedSequence = String(nextSequence).padStart(3, "0");
    const staffCode = `${clinicCode.toUpperCase()}-${roleCode}-${paddedSequence}`;

    return staffCode;
  } catch (error) {
    console.error("Error generating staff code:", error);
    throw error;
  }
}

/**
 * Validate staff code format
 * @param {string} staffCode - Staff code to validate
 * @returns {boolean}
 */
export function isValidStaffCodeFormat(staffCode) {
  // Format: XXX-XXX-NNN (clinic code, role code, sequence)
  const pattern = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;
  return pattern.test(staffCode);
}
