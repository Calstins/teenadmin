// lib/auth.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearAuth: () => void; // Add method to clear auth without redirect
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        set({ user: null, token: null, isAuthenticated: false });
        // Only redirect if we're not already on login page
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          window.location.href = '/login';
        }
      },
      clearAuth: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      // Add error handling for persist
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth rehydration error:', error);
        }
      },
    }
  )
);
