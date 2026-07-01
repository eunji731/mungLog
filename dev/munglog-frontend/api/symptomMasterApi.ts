import { apiClient } from '@/lib/apiClient';

export interface SymptomMaster {
  id: number;
  name: string;
  isActive: boolean;
  isGlobal: boolean;
}

export const symptomMasterApi = {
  getAll: async (): Promise<SymptomMaster[]> => {
    const res = await apiClient.get('/admin/symptoms');
    return res.data || [];
  },

  create: async (payload: { name: string }): Promise<SymptomMaster> => {
    const res = await apiClient.post('/admin/symptoms', payload);
    return res.data;
  },

  update: async (id: number, payload: { name: string }): Promise<SymptomMaster> => {
    const res = await apiClient.put(`/admin/symptoms/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.put(`/admin/symptoms/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.put(`/admin/symptoms/${id}/activate`);
  },

  merge: async (sourceId: number, targetId: number): Promise<void> => {
    await apiClient.post('/admin/symptoms/merge', { sourceId, targetId });
  },
};
