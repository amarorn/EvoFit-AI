import { api } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};
