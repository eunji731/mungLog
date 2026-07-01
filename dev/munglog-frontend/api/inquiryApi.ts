import { apiClient } from '@/lib/apiClient';

export interface Inquiry {
  id: string;
  title: string;
  content: string;
  reply: string | null;
  isReplied: boolean;
  isReplyNew: boolean;
  isNew: boolean;
  createdAt: string;
  repliedAt: string | null;
}

export interface InquiryRequest {
  title: string;
  content: string;
}

export const inquiryApi = {
  create: async (request: InquiryRequest): Promise<Inquiry> => {
    const res = await apiClient.post<Inquiry>('/inquiries', request);
    return res.data;
  },

  getMyInquiries: async (): Promise<Inquiry[]> => {
    const res = await apiClient.get<Inquiry[]>('/inquiries');
    return res.data;
  },

  markReplyRead: async (inquiryId: string): Promise<Inquiry> => {
    const res = await apiClient.patch<Inquiry>(`/inquiries/${inquiryId}/read-reply`);
    return res.data;
  },
};

export const inquiryAdminApi = {
  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<number>('/admin/inquiries/unread-count');
    return res.data;
  },

  getAll: async (): Promise<Inquiry[]> => {
    const res = await apiClient.get<Inquiry[]>('/admin/inquiries');
    return res.data;
  },

  markRead: async (inquiryId: string): Promise<Inquiry> => {
    const res = await apiClient.patch<Inquiry>(`/admin/inquiries/${inquiryId}/read`);
    return res.data;
  },

  reply: async (inquiryId: string, reply: string): Promise<Inquiry> => {
    const res = await apiClient.post<Inquiry>(`/admin/inquiries/${inquiryId}/reply`, { reply });
    return res.data;
  },
};
