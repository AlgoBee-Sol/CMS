import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", // Next.js rewrite proxies this in dev
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          // Attempt token refresh using raw axios to prevent infinite loops
          const response = await axios.post("/api/auth/refresh-token", { refreshToken });
          if (response.data?.success && response.data?.data?.accessToken) {
            const newToken = response.data.data.accessToken;
            localStorage.setItem("auth_token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed or expired
      }
      
      // Clear storage and redirect on auth failure
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_user");
        
        // Only redirect if not already on the login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Format error to match ApiError structure
    const apiError = {
      message: error.response?.data?.error || error.response?.data?.message || "An unexpected error occurred",
      errors: error.response?.data?.errors || null,
      statusCode: error.response?.status || 500,
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;
