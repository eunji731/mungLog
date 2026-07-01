import { apiClient } from '@/lib/apiClient';

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isNew: boolean;
}

export interface NoticeRequest {
  title: string;
  content: string;
}

export const noticeApi = {
  getAll: async (): Promise<Notice[]> => {
    const res = await apiClient.get<Notice[]>('/notices');
    return res.data;
  },

  getOne: async (id: string): Promise<Notice> => {
    const res = await apiClient.get<Notice>(`/notices/${id}`);
    return res.data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/notices/read');
  },
};

export const noticeAdminApi = {
  create: async (request: NoticeRequest): Promise<Notice> => {
    const res = await apiClient.post<Notice>('/admin/notices', request);
    return res.data;
  },

  update: async (id: string, request: NoticeRequest): Promise<Notice> => {
    const res = await apiClient.put<Notice>(`/admin/notices/${id}`, request);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/notices/${id}`);
  },
};
