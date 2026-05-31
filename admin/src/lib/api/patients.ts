import apiClient from "./client";

export const patientsApi = {
  getPatients: async (params: { page?: number; limit?: number; search?: string; clinicId?: string; cnic?: string }) => {
    const response = await apiClient.get("/admin/patients", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        clinicId: params.clinicId || undefined,
        cnic: params.cnic || undefined,
      },
    });
    return response.data;
  },
};
