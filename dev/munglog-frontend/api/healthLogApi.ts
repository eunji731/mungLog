import { apiClient } from '@/lib/apiClient';

export interface HealthLogCreateRequest {
  dogId: string;
  content: string;
}

export interface HealthLog {
  id: string | number;
  dogId: string;
  logDate: string;
  content: string;
  createdAt: string;
}

export const healthLogApi = {
  // 퀵 메모 등록
  createLog: async (payload: HealthLogCreateRequest) => {
    const response = await apiClient.post('/dashboard/health-logs', {
      petId: payload.dogId,
      content: payload.content,
    });
    return response.data;
  },

  // 최근 메모 목록 조회
  getRecentLogs: async (dogId?: string) => {
    const params = dogId ? { petId: dogId } : {};
    const response = await apiClient.get('/dashboard/health-logs', { params });
    // 인터셉터가 response.data.data를 이미 까서 배열을 주는지 확인 필요
    return response.data;
  },

  // 메모 삭제
  deleteLog: async (id: string | number) => {
    await apiClient.delete(`/dashboard/health-logs/${id}`);
  }
};
