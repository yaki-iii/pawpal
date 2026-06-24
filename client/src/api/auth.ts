import apiClient from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

/**
 * Auth API — register, login, get current user.
 */
export const authApi = {
  /** Register a new account. Returns user + JWT token. */
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient.post('/auth/register', payload);
  },

  /** Login with email + password. Returns user + JWT token. */
  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post('/auth/login', payload);
  },

  /** Get current authenticated user info. */
  getMe(): Promise<User> {
    return apiClient.get('/auth/me');
  },
};
