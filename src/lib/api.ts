// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - ONLY logout on auth-specific 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-logout on login page or during login attempts
    if (
      typeof window !== 'undefined' &&
      window.location.pathname === '/login'
    ) {
      return Promise.reject(error);
    }

    // Only auto-logout for authentication-related 401s, not all 401s
    if (
      error.response?.status === 401 &&
      (error.response?.data?.message?.includes('Invalid token') ||
        error.response?.data?.message?.includes('Token expired') ||
        error.response?.data?.message?.includes('No token provided') ||
        error.response?.data?.message?.includes('Unauthorized') ||
        error.response?.data?.message?.includes('Authentication required'))
    ) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/user/login', credentials),

  getCurrentUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  },
};

// Challenges API
export const challengesAPI = {
  getAll: (params?: any) => api.get('/admin/challenges', { params }),
  create: (data: any) => api.post('/admin/challenges', data),
  publish: (id: string) => api.patch(`/admin/challenges/${id}/publish`),
  delete: (id: string) => api.delete(`/admin/challenges/${id}`),
};

// Staff API
export const staffAPI = {
  getAll: (params?: any) => api.get('/admin/staff', { params }),
  create: (data: any) => api.post('/admin/staff', data),
  update: (id: string, data: any) => api.patch(`/admin/staff/${id}`, data),
  delete: (id: string) => api.delete(`/admin/staff/${id}`),
};

// Teens API
export const teensAPI = {
  getAll: (params?: any) => api.get('/teens', { params }),
  getById: (id: string) => api.get(`/teens/${id}`),
};

// Submissions API
export const submissionsAPI = {
  getReviewQueue: (params?: any) =>
    api.get('/submissions/review-queue', { params }),
  review: (id: string, data: any) =>
    api.patch(`/submissions/${id}/review`, data),
};

// Analytics API
export const analyticsAPI = {
  getProgressOverview: (params?: any) =>
    api.get('/progress/analytics/overview', { params }),
  getBadgeStats: (params?: any) => api.get('/badges/stats', { params }),
};

// Raffle API
export const raffleAPI = {
  getEligible: (year: number) => api.get(`/raffle/eligible/${year}`),
  createDraw: (data: any) => api.post('/raffle/draw', data),
  getHistory: () => api.get('/raffle/history'),
};

export default api;
