import { apiClient } from '@/lib/apiClient';
import type { VaccinationType } from '@/types/vaccination';

export const adminVaccinationApi = {
  getAll: async (): Promise<VaccinationType[]> => {
    const res = await apiClient.get('/admin/vaccination-types');
    return res.data || [];
  },

  create: async (payload: { name: string; intervalDays?: number | null }): Promise<VaccinationType> => {
    const res = await apiClient.post('/admin/vaccination-types', payload);
    return res.data;
  },

  update: async (id: number, payload: { name: string; intervalDays?: number | null }): Promise<VaccinationType> => {
    const res = await apiClient.put(`/admin/vaccination-types/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/vaccination-types/${id}`);
  },

  getUserCreatedTypes: async (): Promise<VaccinationType[]> => {
    const res = await apiClient.get('/admin/vaccination-types/user-types');
    return res.data || [];
  },

  mergeUserTypeToGlobal: async (sourceId: number, targetId: number): Promise<void> => {
    await apiClient.post('/admin/vaccination-types/merge', { sourceId, targetId });
  },
};
