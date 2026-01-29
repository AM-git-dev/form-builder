import api from './api.js';
import type { User, LoginPayload, RegisterPayload } from '../types/auth.types.js';
import type { ApiResponse } from '../types/api.types.js';

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/login', payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/register', payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data.data;
}

export async function refreshToken(): Promise<void> {
  await api.post('/auth/refresh');
}
