// client/src/services/api.js
// Purpose: Centralized API service using Axios
// All HTTP requests to the backend go through this file

import axios from "axios";

// ============================================
// Create Axios Instance
// ============================================
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// ============================================
// Request Interceptor
// Automatically attach JWT token to every request
// ============================================
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("autocare_token");

    if (token) {
      // Attach token in Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// Handle global errors (e.g., 401 Unauthorized)
// ============================================
API.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => {
    // If token expired or invalid, log user out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("autocare_token");
      localStorage.removeItem("autocare_user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API Calls
// ============================================
export const authAPI = {
  // Register new user
  register: (userData) => API.post("/auth/register", userData),

  // Login user
  login: (credentials) => API.post("/auth/login", credentials),

  // Get current user profile
  getProfile: () => API.get("/auth/profile"),

  // Update user profile
  updateProfile: (data) => API.put("/auth/profile", data),
};

// ============================================
// Services API Calls
// ============================================
export const servicesAPI = {
  // Get all services (with optional search/filter)
  getAll: (params) => API.get("/services", { params }),

  // Get single service by ID
  getById: (id) => API.get(`/services/${id}`),

  // Create new service (Admin)
  create: (serviceData) => API.post("/services", serviceData),

  // Update service (Admin)
  update: (id, serviceData) => API.put(`/services/${id}`, serviceData),

  // Delete service (Admin)
  delete: (id) => API.delete(`/services/${id}`),
};

// ============================================
// Bookings API Calls
// ============================================
export const bookingsAPI = {
  // Create new booking
  create: (bookingData) => API.post("/bookings", bookingData),

  // Get all bookings (admin: all, customer: own)
  getAll: () => API.get("/bookings"),

  // Get single booking
  getById: (id) => API.get(`/bookings/${id}`),

  // Update booking (Admin - status changes)
  update: (id, data) => API.put(`/bookings/${id}`, data),

  // Delete booking (Admin)
  delete: (id) => API.delete(`/bookings/${id}`),

  // Track bookings by email (public)
  trackByEmail: (email) => API.get(`/bookings/track/${email}`),
};

// ============================================
// Users API Calls (Admin only)
// ============================================
export const usersAPI = {
  // Get all users
  getAll: () => API.get("/users"),

  // Get single user
  getById: (id) => API.get(`/users/${id}`),

  // Delete user
  delete: (id) => API.delete(`/users/${id}`),

  // Get admin dashboard stats
  getDashboardStats: () => API.get("/users/dashboard-stats"),
};

// Export the base API instance as default
export default API;