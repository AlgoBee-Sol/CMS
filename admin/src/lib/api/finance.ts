import apiClient from "./client";

export const financeApi = {
  getDashboardSummary: async () => {
    const response = await apiClient.get("/admin/financials/dashboard/summary");
    return response.data;
  },

  getMonthlyRevenue: async (year: number) => {
    const response = await apiClient.get("/admin/financials/revenue/monthly", {
      params: { year },
    });
    return response.data;
  },

  getYearlyRevenue: async () => {
    const response = await apiClient.get("/admin/financials/revenue/yearly");
    return response.data;
  },

  getSubscriptionAnalytics: async () => {
    const response = await apiClient.get("/admin/financials/subscriptions/analytics");
    return response.data;
  },

  getPayments: async (params: { page?: number; limit?: number; clinicId?: string; paymentMethod?: string; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get("/admin/financials/payments", {
      params: {
        page: params.page,
        limit: params.limit,
        clinicId: params.clinicId || undefined,
        paymentMethod: params.paymentMethod || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
      },
    });
    return response.data;
  },

  getClinicPayments: async (clinicId: string, params: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/admin/financials/clinics/${clinicId}/payments`, {
      params,
    });
    return response.data;
  },

  recordPayment: async (data: { clinicId: string; amount: number; paymentMethod: string; description?: string }) => {
    const response = await apiClient.post("/admin/financials/payments", data);
    return response.data;
  },
};
