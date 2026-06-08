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

  login: (email: string, password: string, rememberMe?: boolean) => Promise<string>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<void>;
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

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          const { user, token } = res.data.data;
          const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
          Cookies.set('token', token, { expires: 7, secure: isHttps, sameSite: 'strict' });
          if (typeof window !== 'undefined') localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login({ email, password, rememberMe });
          const { user, token, redirect } = res.data.data;
          const expires = rememberMe ? 30 : 7;
          const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
          Cookies.set('token', token, { expires, secure: isHttps, sameSite: 'strict' });
          if (typeof window !== 'undefined') localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return redirect || '/login';
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
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
        if (current) set({ user: { ...current, ...data } });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
