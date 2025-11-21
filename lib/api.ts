import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Use environment variable for base URL
// Default backend URL - update this to match your actual Render backend service URL
const backendURL: string =
  process.env.NEXT_PUBLIC_API_URL || "https://womecare-backend-sohr.onrender.com";

// Log the backend URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', `${backendURL}/api`);
}

// Create axios instance
export const api = axios.create({
  baseURL: `${backendURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Enhanced error logging for debugging
    if (error.response) {
      // Server responded with error status
      console.error(`API Error [${error.response.status}]:`, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Network Error:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });
    } else {
      // Error in request setup
      console.error('API Request Error:', error.message);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
