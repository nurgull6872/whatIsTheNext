import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { toApiError } from './errors';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  // voter_token cerezinin (§4.4 middleware) tarayici ile gidip gelmesi icin sart.
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ayni anda birden fazla istek 401 alirsa (orn. sayfa acilisinda paralel
// sorgular) yenilemeyi tek seferde yapip digerlerini kuyruga alir.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error('Refresh token yok.');
  }
  const response = await axios.post<{ access: string }>(`${API_URL}/auth/refresh/`, { refresh });
  setTokens({ access: response.data.access });
  return response.data.access;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const isAuthEndpoint =
      config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || !config || config._retried || isAuthEndpoint) {
      throw toApiError(error);
    }

    config._retried = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return await apiClient(config);
    } catch {
      clearTokens();
      throw toApiError(error);
    }
  },
);
