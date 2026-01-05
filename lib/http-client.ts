import axios, { AxiosInstance } from "axios";

// Shared axios instance for the entire application
export const httpClient: AxiosInstance = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging (development only)
if (process.env.NODE_ENV === "development") {
  httpClient.interceptors.request.use(
    (config) => {
      console.log(`🌐 [HTTP] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error("🌐 [HTTP Request Error]", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging (development only)
  httpClient.interceptors.response.use(
    (response) => {
      console.log(
        `✅ [HTTP] ${
          response.status
        } ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
      return response;
    },
    (error) => {
      console.error(
        `❌ [HTTP Error] ${
          error.response?.status || "Network"
        } ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.data || error.message
      );
      return Promise.reject(error);
    }
  );
}
