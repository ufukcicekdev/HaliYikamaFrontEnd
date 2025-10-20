import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login/', { email, password });
          
          console.log('Login response:', response);
          
          if (response.success && response.data) {
            // Backend returns { success, data: { user, tokens } }
            // apiClient wraps it in { success, data: {...} }
            const responseData = response.data as any;
            const { user, tokens } = responseData.data || responseData;
            
            if (!tokens || !user) {
              throw new Error('Invalid response structure');
            }
            
            apiClient.setTokens(tokens.access, tokens.refresh);
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            console.error('Login failed - response:', response);
            set({ isLoading: false });
            throw new Error(response.error?.message || 'Login failed');
          }
        } catch (error: any) {
          console.error('Login exception:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/register/', data);
          
          if (response.success && response.data) {
            // Backend returns { success, data: { user, tokens } }
            // apiClient wraps it in { success, data: {...} }
            const responseData = response.data as any;
            const { user, tokens } = responseData.data || responseData;
            
            if (!tokens || !user) {
              throw new Error('Invalid response structure');
            }
            
            apiClient.setTokens(tokens.access, tokens.refresh);
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
            throw new Error(response.error?.message || 'Registration failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        apiClient.clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.get('/auth/profile/');
          
          if (response.success && response.data) {
            set({ user: response.data, isAuthenticated: true, isLoading: false });
          }
        } catch (error: any) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          throw error;
        }
      },

      updateUser: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.patch('/auth/profile/', data);
          
          if (response.success && response.data) {
            set({ user: response.data, isLoading: false });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
