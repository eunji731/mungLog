import { apiClient } from '@/lib/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string | null;
  type_id?: string;
  role?: string;
}

export const authApi = {
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  rejoin: async (token: string) => {
    return apiClient.post('/members/rejoin', { token });
  },
  getMe: async (): Promise<User> => {
    try {
      const { data } = await apiClient.get<any>('/members/me');

      return {
        id: String(data.id),
        email: data.kakaoEmail ?? data.email ?? '',
        name: data.nickname ?? data.name ?? '',
        profileImageUrl: data.profileImageUrl ?? null,
        type_id: data.type_id,
        role: data.role,
      };
    } catch (error) {
      console.error('내 정보를 가져오지 못했습니다:', error);
      throw error;
    }
  },
};
