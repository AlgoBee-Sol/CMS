// =============================================================================
// Authentication Controller
// Handles login, register, token refresh, and logout
// =============================================================================

import { prisma } from "../../config/db.config.js";
import { env } from "../../config/env.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "../../utils/errors.js";
import { generateStaffCode } from "../../services/staffCode.service.js";
import { encrypt } from "../../utils/encryption.util.js";

/**
 * Login endpoint for all user types
 * Returns accessToken (15 min) and refreshToken (7 days)
 */
export async function login(req, res) {
  const { email, password, isClinicUser = true } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  let user;

  // Check if SuperAdmin or Clinic User
  if (!isClinicUser) {
    user = await prisma.superAdmin.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, userType: "superAdmin" },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: user.id, userType: "superAdmin" },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 900, // 15 minutes in seconds
      },
    });
  }

  // Clinic user login
  user = await prisma.user.findFirst({
    where: { email, clinic: { isDeleted: false } },
    include: { clinic: true },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate tokens
  const accessToken = jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      userType: user.role === "patient" ? "patient" : "staff",
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      userType: user.role === "patient" ? "patient" : "staff",
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinicId: user.clinicId,
      },
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
    },
  });
}

/**
 * Register endpoint for clinic users
 * Only clinic admins can register other staff
 */
export async function register(req, res) {
  const { email, password, firstName, lastName, phone, role, clinicId, cnic } =
    req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role || !clinicId) {
    throw new BadRequestError("Missing required fields");
  }

  // Check clinic exists and is not deleted
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  if (!clinic || clinic.isDeleted) {
    throw new NotFoundError("Clinic not found");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { clinicId, email },
  });

  if (existingUser) {
    throw new ConflictError("User already exists in this clinic");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Encrypt CNIC if provided
  let encryptedCnic = null;
  if (cnic) {
    encryptedCnic = encrypt(cnic);
  }

  // Generate staff code if not patient
  let staffCode = null;
  if (role !== "patient") {
    staffCode = await generateStaffCode(clinicId, clinic.code, role);
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      cnic: encryptedCnic,
      role,
      staffCode,
      clinicId,
    },
  });

  // Generate tokens
  const accessToken = jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      userType: user.role === "patient" ? "patient" : "staff",
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      clinicId: user.clinicId,
      role: user.role,
      userType: user.role === "patient" ? "patient" : "staff",
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        staffCode: user.staffCode,
        clinicId: user.clinicId,
      },
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
    },
  });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError("Refresh token is required");
  }

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    let user;
    if (payload.userType === "superAdmin") {
      user = await prisma.superAdmin.findUnique({
        where: { id: payload.userId },
      });
      if (!user) {
        throw new UnauthorizedError("User not found");
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { clinic: true },
      });
      if (!user || user.clinic.isDeleted) {
        throw new UnauthorizedError("User not found or clinic is deleted");
      }
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        clinicId: user.clinicId || undefined,
        role: user.role || undefined,
        userType: payload.userType,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        tokenType: "Bearer",
        expiresIn: 900,
      },
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Refresh token has expired");
    }
    throw new UnauthorizedError("Invalid refresh token");
  }
}

/**
 * Logout endpoint (optional - can be used to blacklist tokens in Redis)
 */
export async function logout(req, res) {
  // In a production system, you'd add the token to a Redis blacklist here
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
}
