import { apiClient } from './client';
import type { User } from '../types/user';

interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  display_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register/', payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login/', payload);
  return data;
}

export async function logout(refresh: string): Promise<void> {
  await apiClient.post('/auth/logout/', { refresh });
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me/');
  return data;
}

export async function updateMe(payload: { display_name: string }): Promise<User> {
  const { data } = await apiClient.patch<User>('/auth/me/', payload);
  return data;
}
