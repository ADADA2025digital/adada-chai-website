import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:8000/api",
  baseURL: "https://urbanviewre.com/chai-backend/api",

  headers: {
    Accept: "application/json",
  },
  timeout: 300000,
});

// Optional: Add a request interceptor if needed for other purposes
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - useful for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    return Promise.reject(error);
  },
);

export default api;
