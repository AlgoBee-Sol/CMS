import apiClient from "./client";

export const authApi = {
  login: async (credentials: any) => {
    // For super admins, isClinicUser is false
    const response = await apiClient.post("/auth/login", {
      ...credentials,
      isClinicUser: false,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },
};
