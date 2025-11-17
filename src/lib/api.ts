// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      window.location.pathname === '/login'
    ) {
      return Promise.reject(error);
    }

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
  getAll: async (params?: any) => {
    const response = await api.get('/admin/challenges', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/challenges/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/challenges', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/challenges/${id}`, data);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.patch(`/admin/challenges/${id}/publish`);
    return response.data;
  },

  toggle: async (id: string, field: 'isPublished' | 'isActive') => {
    const response = await api.patch(`/admin/challenges/${id}/toggle`, {
      field,
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/challenges/${id}`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getByChallengeId: async (challengeId: string) => {
    const response = await api.get(`/admin/tasks/challenge/${challengeId}`);
    return response.data;
  },

  getById: async (taskId: string) => {
    const response = await api.get(`/admin/tasks/${taskId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/tasks', data);
    return response.data;
  },

  update: async (taskId: string, data: any) => {
    const response = await api.put(`/admin/tasks/${taskId}`, data);
    return response.data;
  },

  delete: async (taskId: string) => {
    const response = await api.delete(`/admin/tasks/${taskId}`);
    return response.data;
  },
};

// Submissions API
export const submissionsAPI = {
  getReviewQueue: async (params?: any) => {
    const response = await api.get('/admin/submissions/review-queue', {
      params,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/submissions/${id}`);
    return response.data;
  },

  review: async (id: string, data: any) => {
    const response = await api.patch(`/admin/submissions/${id}/review`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/submissions/${id}`);
    return response.data;
  },
};

// Badges API
export const badgesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/admin/badges', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/badges/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/badges', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/badges/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/badges/${id}`);
    return response.data;
  },

  getStats: async (params?: any) => {
    const response = await api.get('/admin/badges/stats', { params });
    return response.data;
  },
};

// Teens API
export const teensAPI = {
  getAll: (params?: any) => api.get('/admin/teens', { params }),
  getById: (id: string) => api.get(`/admin/teens/${id}`),
};

// Staff API
export const staffAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/admin/staff', { params });
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/staff', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/staff/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getProgressOverview: async (params?: any) => {
    const response = await api.get('/progress/analytics/overview', { params });
    return response.data;
  },

  getBadgeStats: async (params?: any) => {
    const response = await api.get('/admin/badges/stats', { params });
    return response.data;
  },
};

// Raffle API
export const raffleAPI = {
  getEligible: async (year: number) => {
    const response = await api.get(`/raffle/eligible/${year}`);
    return response.data;
  },

  createDraw: async (data: any) => {
    const response = await api.post('/raffle/draw', data);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/raffle/history');
    return response.data;
  },
};

export default api;
