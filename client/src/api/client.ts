import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

/**
 * Determine API base URL based on environment.
 * - Development: '/api/v1' (handled by Vite dev server proxy)
 * - Production: read from VITE_API_BASE_URL env var, fallback to '/api/v1'
 */
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Axios instance with baseURL and interceptors.
 * - Request interceptor: injects JWT token from localStorage
 * - Response interceptor: unwraps ApiResponse, handles 401 redirect
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('pawpal_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor: unwrap data and handle errors
apiClient.interceptors.response.use(
  (response) => {
    const apiData = response.data as ApiResponse;
    // Successful response with code 0
    if (apiData.code === 0) {
      return apiData.data;
    }
    // Business logic error
    const error = new Error(apiData.message || '请求失败');
    (error as Error & { code?: number }).code = apiData.code;
    return Promise.reject(error);
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401: Unauthorized — clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('pawpal_token');
        localStorage.removeItem('pawpal_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }

      const message = data?.message || `请求错误 (${status})`;
      const customError = new Error(message) as Error & { code?: number; status?: number };
      customError.code = data?.code || status;
      customError.status = status;
      return Promise.reject(customError);
    }

    if (error.request) {
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
