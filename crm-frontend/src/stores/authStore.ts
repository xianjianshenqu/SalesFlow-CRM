import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  refreshToken: string | null; // 存储 refreshToken
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean; // 跟踪 hydration 状态
  
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
  refreshAccessToken: () => Promise<boolean>; // 刷新 token
  clearError: () => void;
  setHasHydrated: (state: boolean) => void; // 设置 hydration 状态
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null, // 存储 refreshToken
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false, // 初始为 false，hydration 完成后变为 true

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login({ email, password });
          localStorage.setItem('auth_token', data.tokens.accessToken);
          localStorage.setItem('refresh_token', data.tokens.refreshToken); // 存储 refreshToken
          set({
            user: data.user,
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
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
          localStorage.setItem('auth_token', response.data.tokens.accessToken);
          localStorage.setItem('refresh_token', response.data.tokens.refreshToken); // 存储 refreshToken
          set({
            user: response.data.user,
            token: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
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
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          token: null,
          refreshToken: null,
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
          // Token可能已过期，尝试刷新
          const refreshed = await get().refreshAccessToken();
          if (!refreshed) {
            // 刷新失败，清除状态
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
          }
        }
      },

      setToken: (token: string) => {
        localStorage.setItem('auth_token', token);
        set({ token, isAuthenticated: true });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const { data } = await authApi.refreshToken();
          localStorage.setItem('auth_token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          set({
            token: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
          });
          return true;
        } catch {
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'crm-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken, // 持久化 refreshToken
        user: state.user,
        isAuthenticated: !!state.token, // 有 token 就认为已认证
      }),
      // hydration 完成后的回调
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // 如果有 token，验证其有效性
        if (state?.token) {
          state.getProfile().catch(() => {
            // token 无效时会自动清除状态
          });
        }
      },
    }
  )
);