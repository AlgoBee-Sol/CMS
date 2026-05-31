export interface ClinicsFilter {
  page?: number;
  limit?: number;
  search?: string;
  isDeleted?: boolean;
}

export interface PatientsFilter {
  page?: number;
  limit?: number;
  search?: string;
  clinicId?: string;
  cnic?: string;
}

export interface PaymentsFilter {
  page?: number;
  limit?: number;
  clinicId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export const queryKeys = {
  clinics: {
    all: ["clinics"] as const,
    list: (filters: ClinicsFilter) => ["clinics", "list", filters] as const,
    detail: (id: string) => ["clinics", "detail", id] as const,
    owner: (id: string) => ["clinics", "owner", id] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (filters: PatientsFilter) => ["patients", "list", filters] as const,
  },
  finance: {
    summary: ["finance", "summary"] as const,
    payments: (filters: PaymentsFilter) => ["finance", "payments", filters] as const,
    clinicPayments: (clinicId: string, page?: number, limit?: number) => ["finance", "clinicPayments", clinicId, { page, limit }] as const,
    revenue: (year: number) => ["finance", "revenue", year] as const,
    yearlyComparison: ["finance", "yearlyComparison"] as const,
    subscriptionAnalytics: ["finance", "subscriptionAnalytics"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
};
