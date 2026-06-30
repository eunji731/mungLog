import { apiClient } from '@/lib/apiClient';
import { getImagePath } from '@/lib/clientApi';

export interface SymptomSnapDto {
  id: string;
  petId: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  symptomTags: string[];
  memo: string;
  photoUrl?: string;
  status: 'MONITORING' | 'RESOLVED';
  resolvedRecordId?: string;
  resolvedRecordTitle?: string;
  linkedScheduleId?: string;
  linkedScheduleTitle?: string;
}

export interface SymptomSnapCreateRequest {
  petId: string;
  date: string;
  time: string;
  symptomTags: string[];
  memo: string;
}

export const symptomSnapApi = {
  getSnaps: async (params?: {
    petId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SymptomSnapDto[]> => {
    const res = await apiClient.get('/symptom-snaps', { params });
    return (res.data || []).map(mapSnap);
  },

  createSnap: async (
    data: SymptomSnapCreateRequest,
    photoFile?: File
  ): Promise<SymptomSnapDto> => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (photoFile) form.append('symptomImage', photoFile);
    const res = await apiClient.post('/symptom-snaps', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapSnap(res.data);
  },

  updateSnap: async (
    id: string,
    data: SymptomSnapCreateRequest,
    photoFile?: File
  ): Promise<SymptomSnapDto> => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (photoFile) form.append('symptomImage', photoFile);
    const res = await apiClient.put(`/symptom-snaps/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapSnap(res.data);
  },

  deleteSnap: async (id: string): Promise<void> => {
    await apiClient.delete(`/symptom-snaps/${id}`);
  },

  linkRecord: async (snapId: string, resolvedRecordId: string): Promise<SymptomSnapDto> => {
    const res = await apiClient.patch(`/symptom-snaps/${snapId}/link`, { resolvedRecordId });
    return mapSnap(res.data);
  },

  unlinkRecord: async (snapId: string): Promise<SymptomSnapDto> => {
    const res = await apiClient.patch(`/symptom-snaps/${snapId}/unlink`);
    return mapSnap(res.data);
  },

  linkSchedule: async (snapId: string, linkedScheduleId: string): Promise<SymptomSnapDto> => {
    const res = await apiClient.patch(`/symptom-snaps/${snapId}/link-schedule`, { linkedScheduleId });
    return mapSnap(res.data);
  },

  unlinkSchedule: async (snapId: string): Promise<SymptomSnapDto> => {
    const res = await apiClient.patch(`/symptom-snaps/${snapId}/unlink-schedule`);
    return mapSnap(res.data);
  },
};

function mapSnap(raw: any): SymptomSnapDto {
  return {
    id: String(raw.id),
    petId: String(raw.petId),
    date: raw.date,
    time: typeof raw.time === 'string' ? raw.time.slice(0, 5) : raw.time,
    symptomTags: raw.symptomTags || [],
    memo: raw.memo || '',
    photoUrl: raw.photoUrl ? getImagePath(raw.photoUrl) : undefined,
    status: raw.status || 'MONITORING',
    resolvedRecordId: raw.resolvedRecordId ? String(raw.resolvedRecordId) : undefined,
    resolvedRecordTitle: raw.resolvedRecordTitle || undefined,
    linkedScheduleId: raw.linkedScheduleId ? String(raw.linkedScheduleId) : undefined,
    linkedScheduleTitle: raw.linkedScheduleTitle || undefined,
  };
}
