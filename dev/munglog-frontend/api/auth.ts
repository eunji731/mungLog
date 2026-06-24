import { apiClient } from '@/lib/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string | null;
  type_id?: string;
}

export const authApi = {
  login: async (credentials: any) => {
    return apiClient.post('/auth/login', credentials);
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  refreshCsrfToken: async () => {
    // 안전한 GET 호출을 통해 최신 XSRF-TOKEN 쿠키를 브라우저에 세팅함
    return apiClient.get('/csrf');
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
      };
    } catch (error) {
      console.error('내 정보를 가져오지 못했습니다:', error);
      throw error;
    }
  },
};
