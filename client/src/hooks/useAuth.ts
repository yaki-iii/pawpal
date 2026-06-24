import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { authApi } from '../api/auth';
import type { LoginPayload, RegisterPayload } from '../types';

/**
 * useAuth — encapsulates auth store + API calls.
 * Provides login, register, logout, and initialization.
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, logout, updateUser, initialize } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const login = useCallback(
    async (payload: LoginPayload): Promise<boolean> => {
      try {
        const result = await authApi.login(payload);
        setAuth(result.user, result.token);
        showSnackbar('登录成功', 'success');
        return true;
      } catch (error) {
        showSnackbar((error as Error).message || '登录失败', 'error');
        return false;
      }
    },
    [setAuth, showSnackbar],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<boolean> => {
      try {
        const result = await authApi.register(payload);
        setAuth(result.user, result.token);
        showSnackbar('注册成功，请创建第一只宠物档案', 'success');
        return true;
      } catch (error) {
        showSnackbar((error as Error).message || '注册失败', 'error');
        return false;
      }
    },
    [setAuth, showSnackbar],
  );

  const handleLogout = useCallback(() => {
    logout();
    showSnackbar('已退出登录', 'info');
  }, [logout, showSnackbar]);

  const updateProfile = useCallback(
    async (data: Partial<{ nickname: string; avatar: string; bio: string; city: string }>): Promise<boolean> => {
      try {
        // API call would go here; for now, update store
        updateUser(data);
        showSnackbar('资料已更新', 'success');
        return true;
      } catch (error) {
        showSnackbar((error as Error).message || '更新失败', 'error');
        return false;
      }
    },
    [updateUser, showSnackbar],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
    updateProfile,
    initialize,
  };
}
