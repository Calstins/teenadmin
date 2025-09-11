import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
