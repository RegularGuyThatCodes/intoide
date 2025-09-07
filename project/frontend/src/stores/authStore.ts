import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../../../shared/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data.data;
          
          set({ user, token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, role = 'USER') => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/register', {
            name,
            email,
            password,
            role
          });
          const { user, token } = response.data.data;
          
          set({ user, token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth-storage');
      },

      updateUser: (user: User) => {
        set({ user });
      },

      initializeAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Optionally verify token is still valid
          api.get('/auth/me').catch(() => {
            get().logout();
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);