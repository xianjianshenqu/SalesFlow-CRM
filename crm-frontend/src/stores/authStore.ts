import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    department?: string;
    phone?: string;
  }) => Promise<boolean>;
  logout: () => void;
  getProfile: () => Promise<void>;
  setToken: (token: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login({ email, password });
          localStorage.setItem('auth_token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : '登录失败';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          localStorage.setItem('auth_token', response.data.token);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : '注册失败';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      getProfile: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const { data } = await authApi.getProfile();
          set({ user: data, isAuthenticated: true });
        } catch {
          // Token可能已过期
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('auth_token');
        }
      },

      setToken: (token: string) => {
        localStorage.setItem('auth_token', token);
        set({ token, isAuthenticated: true });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'crm-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);