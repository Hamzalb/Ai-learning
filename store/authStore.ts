import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login({ email, password });
          const { user, token } = res.data.data;
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
          if (typeof window !== 'undefined') localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          const { user, token } = res.data.data;
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
          if (typeof window !== 'undefined') localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const res = await authAPI.getMe();
          set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          Cookies.remove('token');
          if (typeof window !== 'undefined') localStorage.removeItem('token');
        }
      },

      updateUser: (data) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...data } });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
