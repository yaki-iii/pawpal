import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

/**
 * Auth store — manages user authentication state.
 * Token and user are persisted to localStorage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('pawpal_token', token);
    localStorage.setItem('pawpal_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  updateUser: (partial: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...partial };
      localStorage.setItem('pawpal_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  logout: () => {
    localStorage.removeItem('pawpal_token');
    localStorage.removeItem('pawpal_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initialize: () => {
    const token = localStorage.getItem('pawpal_token');
    const userStr = localStorage.getItem('pawpal_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('pawpal_token');
        localStorage.removeItem('pawpal_user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
