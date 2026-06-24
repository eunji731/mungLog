import { apiClient } from '@/lib/apiClient';
import type { CareRecord, CareRecordsFilter, CareRecordCreateRequest } from '@/types/care';

export const careApi = {
  getRecords: async (filters: CareRecordsFilter) => {
    const params: Record<string, string | number> = {};

    const petId = filters.petId ?? filters.dogId;
    if (petId !== undefined) {
      params.petId = petId;
    }

    if (filters.type && filters.type !== 'ALL') {
      params.type = filters.type;
    }

    if (filters.recordTypeId) {
      params.recordTypeId = filters.recordTypeId;
    }

    if (filters.keyword?.trim()) {
      params.keyword = filters.keyword.trim();
    }

    if (filters.startDate) {
      params.startDate = filters.startDate;
    }

    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    const response = await apiClient.get('/care', { params });
    return response.data;
  },

  getRecordDetail: async (recordId: string | number) => {
    const response = await apiClient.get(`/care/${recordId}`);
    return response.data;
  },

  createRecord: async (payload: CareRecordCreateRequest) => {
    return apiClient.post('/care', toCarePayload(payload));
  },

  updateRecord: async (recordId: string | number, payload: CareRecordCreateRequest) => {
    return apiClient.put(`/care/${recordId}`, toCarePayload(payload));
  },

  deleteRecord: async (recordId: string | number) => {
    return apiClient.delete(`/care/${recordId}`);
  },

  // 연관 진료 기록 후보 조회 (지출 기록 등록용 - 서버 측 검색 지원)
  getMedicalRecordCandidates: async (dogId: string | number, keyword?: string): Promise<CareRecord[]> => {
    const response = await apiClient.get(`/care/medical-candidates`, {
      params: { petId: dogId, keyword }
    });
    return response.data;
  },

  // 증상 마스터 목록 검색 (자동완성용)
  searchSymptomMasters: async (keyword: string): Promise<string[]> => {
    const response = await apiClient.get('/symptoms/search', {
      params: { keyword }
    });
    // apiClient 인터셉터에서 이미 response.data.data를 리턴했으므로 response.data는 배열입니다.
    const symptomList = response.data || [];
    return symptomList.map((item: { id: number; name: string }) => item.name);
  },
};

function toCarePayload(payload: CareRecordCreateRequest) {
  return {
    petId: payload.petId ?? payload.dogId,
    recordType: payload.recordType ?? recordTypeFromId(payload.recordTypeId),
    recordDate: payload.recordDate,
    title: payload.title,
    note: payload.note,
    sourceScheduleId: payload.sourceScheduleId,
    fileIds: payload.fileIds,
    medicalDetail: payload.medicalDetail ?? payload.medicalDetails,
    expenseDetail: payload.expenseDetail ?? payload.expenseDetails,
  };
}

function recordTypeFromId(id?: number) {
  const types = ['HOSPITAL', 'MEDICINE', 'GROOMING', 'VACCINATION', 'CHECKUP', 'EXPENSE', 'ETC'];
  return id ? types[id - 1] ?? 'ETC' : 'ETC';
}
