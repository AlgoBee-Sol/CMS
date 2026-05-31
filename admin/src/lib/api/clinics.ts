import apiClient from "./client";

export const clinicsApi = {
  getClinics: async (params: { page?: number; limit?: number; search?: string; isDeleted?: boolean }) => {
    const response = await apiClient.get("/admin/clinics", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        isDeleted: params.isDeleted ? "true" : "false",
      },
    });
    return response.data;
  },

  createClinic: async (data: any) => {
    const response = await apiClient.post("/admin/clinics", data);
    return response.data;
  },

  getClinicById: async (id: string) => {
    const response = await apiClient.get(`/admin/clinics/${id}`);
    return response.data;
  },

  updateClinic: async (id: string, data: any) => {
    const response = await apiClient.patch(`/admin/clinics/${id}`, data);
    return response.data;
  },

  deleteClinic: async (id: string) => {
    const response = await apiClient.delete(`/admin/clinics/${id}`);
    return response.data;
  },

  restoreClinic: async (id: string) => {
    const response = await apiClient.post(`/admin/clinics/${id}/restore`);
    return response.data;
  },

  getClinicOwner: async (id: string) => {
    const response = await apiClient.get(`/admin/clinics/${id}/owner`);
    return response.data;
  },

  updateClinicOwner: async (id: string, data: any) => {
    const response = await apiClient.patch(`/admin/clinics/${id}/owner`, data);
    return response.data;
  },

  registerOwner: async (data: any) => {
    const response = await apiClient.post("/auth/register", {
      ...data,
      role: "clinic_owner",
    });
    return response.data;
  },

  updateSubscription: async (id: string, data: any) => {
    const response = await apiClient.patch(`/admin/clinics/${id}/subscription`, data);
    return response.data;
  },
};
