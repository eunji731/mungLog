import { apiClient } from '@/lib/apiClient';
import type { VaccinationType, VaccinationAliasMatch } from '@/types/vaccination';

export const vaccinationTypeApi = {
  getActiveTypes: async (): Promise<VaccinationType[]> => {
    const res = await apiClient.get('/vaccination-types');
    return res.data || [];
  },

  createType: async (payload: { name: string; intervalDays?: number | null }): Promise<VaccinationType> => {
    const res = await apiClient.post('/vaccination-types', payload);
    return res.data;
  },

  updateType: async (typeId: number, payload: { name: string; intervalDays?: number | null }): Promise<VaccinationType> => {
    const res = await apiClient.put(`/vaccination-types/${typeId}`, payload);
    return res.data;
  },

  deactivateType: async (typeId: number): Promise<void> => {
    await apiClient.put(`/vaccination-types/${typeId}/deactivate`);
  },

  mergeTypes: async (sourceId: number, targetId: number): Promise<void> => {
    await apiClient.post('/vaccination-types/merge', { sourceId, targetId });
  },

  matchAlias: async (q: string): Promise<VaccinationAliasMatch[]> => {
    const res = await apiClient.get('/vaccination-types/aliases/match', { params: { q } });
    return res.data || [];
  },

  addAlias: async (typeId: number, alias: string): Promise<void> => {
    await apiClient.post(`/vaccination-types/${typeId}/aliases`, null, { params: { alias } });
  },
};
