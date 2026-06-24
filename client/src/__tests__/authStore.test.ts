import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

// We need to reset the store between tests
const resetStore = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
};

describe('AuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    nickname: '测试用户',
    avatar: 'avatar.png',
    bio: '养宠达人',
    city: '杭州',
    membershipLevel: 'FREE' as never,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  describe('setAuth', () => {
    it('should set user, token, and isAuthenticated=true', () => {
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('jwt-token-123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should persist token and user to localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');

      expect(localStorage.getItem('pawpal_token')).toBe('jwt-token-123');
      expect(localStorage.getItem('pawpal_user')).toBe(JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('should clear user, token, and set isAuthenticated=false', () => {
      // Set up auth state first
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');

      // Logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should remove token and user from localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');
      useAuthStore.getState().logout();

      expect(localStorage.getItem('pawpal_token')).toBeNull();
      expect(localStorage.getItem('pawpal_user')).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should merge partial user data into existing user', () => {
      useAuthStore.getState().setAuth(mockUser, 'token');

      useAuthStore.getState().updateUser({ nickname: '新昵称', city: '上海' });

      const state = useAuthStore.getState();
      expect(state.user?.nickname).toBe('新昵称');
      expect(state.user?.city).toBe('上海');
      // Other fields should remain unchanged
      expect(state.user?.email).toBe('test@example.com');
    });

    it('should do nothing if no user is set', () => {
      // Don't set auth - user is null
      useAuthStore.getState().updateUser({ nickname: 'test' });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should persist updated user to localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, 'token');
      useAuthStore.getState().updateUser({ nickname: '新昵称' });

      const stored = JSON.parse(localStorage.getItem('pawpal_user')!);
      expect(stored.nickname).toBe('新昵称');
    });
  });

  describe('setLoading', () => {
    it('should set isLoading state', () => {
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);

      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe('initialize', () => {
    it('should restore auth state from localStorage', () => {
      localStorage.setItem('pawpal_token', 'stored-token');
      localStorage.setItem('pawpal_user', JSON.stringify(mockUser));

      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('stored-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set unauthenticated state when no token in localStorage', () => {
      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should handle corrupted user JSON in localStorage', () => {
      localStorage.setItem('pawpal_token', 'token');
      localStorage.setItem('pawpal_user', 'invalid-json{{{');

      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);

      // Should clean up corrupted data
      expect(localStorage.getItem('pawpal_token')).toBeNull();
      expect(localStorage.getItem('pawpal_user')).toBeNull();
    });

    it('should set unauthenticated when token exists but user does not', () => {
      localStorage.setItem('pawpal_token', 'token');
      // No user in localStorage

      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
