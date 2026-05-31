// =============================================================================
// TypeScript API Types
// Matches the Prisma schema models and API responses exactly
// =============================================================================

export type SubscriptionStatus = "Active" | "Trial" | "Ended";
export type PlanType = "Basic" | "Professional" | "Enterprise" | "Trial";
export type PaymentMethod = "Bank Transfer" | "Cash" | "Check" | "Card" | "Other";

export interface Clinic {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  logoUrl: string | null;
  address: string | null;
  email: string;
  phone: string;
  termsAndConditions: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  subscription?: Subscription | null;
  payments?: PlatformPayment[];
  userCount?: number;
  appointmentCount?: number;
  sessionCount?: number;
}

export interface Subscription {
  id: string;
  clinicId: string;
  status: string; // "Active", "Trial", "Ended"
  planType: string; // "Basic", "Professional", "Enterprise", "Trial"
  amount: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  clinic?: Clinic;
}

export interface PlatformPayment {
  id: string;
  clinicId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  description: string | null;
  loggedBySuperAdminId: string;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: string;
    name: string;
    code: string;
  };
  loggedBySuperAdmin?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  clinicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  cnic: string | null;
  role: string;
  staffCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clinic?: Clinic;
}

export interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  cnic: string | null;
  createdAt: string;
  clinicName: string;
  assignedDoctor: string;
}

export interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | any; // e.g. clinics: T[]
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // field-level validation errors
  statusCode?: number;
}
