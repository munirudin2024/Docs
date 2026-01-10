import api from '@/lib/axios';
import { AuthResponse } from '@/types';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  async register(
    username: string,
    password: string,
    nama_lengkap: string
  ): Promise<{ message: string; user: any }> {
    const response = await api.post('/auth/register', {
      username,
      password,
      nama_lengkap,
    });
    return response.data;
  },
};
