import { apiClient } from '@/lib/apiClient';
import { RECORD_TYPE_CODES, EXPENSE_CATEGORY_CODES } from '@/lib/codeGroups';
import type { CareRecord, CareRecordsFilter, CareRecordCreateRequest } from '@/types/care';

interface BackendCareListItem {
  id: string;
  petId: string;
  petName: string;
  recordType: string;
  recordDate: string;
  title: string;
  note?: string;
  attachmentCount: number;
  amount?: number | null;
  relatedMedicalRecordId?: string | null;
  medicationStatus?: 'COMPLETED' | 'IN_PROGRESS' | null;
}

interface BackendCareDetail extends Omit<BackendCareListItem, 'attachmentCount' | 'amount' | 'relatedMedicalRecordId' | 'medicationStatus'> {
  medicalDetail?: {
    clinicName?: string;
    symptoms?: string;
    symptomTags?: string[];
    diagnosis?: string;
    treatment?: string;
    medicationStartDate?: string | null;
    medicationDays?: number | null;
    isMedicationCompleted?: boolean | null;
    amount?: number | null;
  } | null;
  expenseDetail?: {
    category?: string;
    amount?: number | null;
    memo?: string;
    relatedMedicalRecordId?: string | null;
  } | null;
  attachments?: unknown[];
}

const recordTypeIdOf = (code?: string) => RECORD_TYPE_CODES.find(c => c.code === code)?.id;
const recordTypeCodeOf = (id?: number, fallbackCode?: string) =>
  fallbackCode || RECORD_TYPE_CODES.find(c => c.id === id)?.code || 'ETC';

const categoryIdOf = (code?: string) => EXPENSE_CATEGORY_CODES.find(c => c.code === code)?.id;
const categoryCodeOf = (id?: number | string, fallbackCode?: string) =>
  fallbackCode || EXPENSE_CATEGORY_CODES.find(c => c.id === Number(id))?.code || 'ETC';

function mapListItem(raw: BackendCareListItem): CareRecord {
  return {
    id: raw.id,
    dogId: raw.petId,
    petId: raw.petId,
    dogName: raw.petName,
    petName: raw.petName,
    dogProfileImageUrl: null,
    recordType: raw.recordType as CareRecord['recordType'],
    recordTypeId: recordTypeIdOf(raw.recordType),
    recordDate: raw.recordDate,
    title: raw.title,
    note: raw.note,
    amount: raw.amount ?? null,
    relatedMedicalRecordId: raw.relatedMedicalRecordId ?? null,
    medicationStatus: raw.medicationStatus === 'IN_PROGRESS' ? 'ACTIVE' : raw.medicationStatus === 'COMPLETED' ? 'COMPLETED' : 'NONE',
    attachmentCount: raw.attachmentCount,
  };
}

function mapDetail(raw: BackendCareDetail): CareRecord {
  const med = raw.medicalDetail;
  const exp = raw.expenseDetail;
  return {
    id: raw.id,
    dogId: raw.petId,
    petId: raw.petId,
    dogName: raw.petName,
    petName: raw.petName,
    dogProfileImageUrl: null,
    recordType: raw.recordType as CareRecord['recordType'],
    recordTypeId: recordTypeIdOf(raw.recordType),
    recordDate: raw.recordDate,
    title: raw.title,
    note: raw.note,
    clinicName: med?.clinicName,
    diagnosis: med?.diagnosis,
    symptoms: med?.symptoms,
    symptomTags: med?.symptomTags,
    treatment: med?.treatment,
    medicationStartDate: med?.medicationStartDate ?? null,
    medicationDays: med?.medicationDays ?? null,
    medicationStatus: med?.isMedicationCompleted === true ? 'COMPLETED' : med?.isMedicationCompleted === false ? 'ACTIVE' : 'NONE',
    categoryCode: exp?.category,
    categoryTypeId: categoryIdOf(exp?.category),
    amount: med?.amount ?? exp?.amount ?? null,
    relatedMedicalRecordId: exp?.relatedMedicalRecordId ?? null,
    attachmentCount: raw.attachments?.length || 0,
  };
}

export const careApi = {
  // 백엔드는 petId 필터만 지원하므로, 나머지(type/recordTypeId/keyword/날짜)는 프런트에서 필터링합니다.
  getRecords: async (filters: CareRecordsFilter): Promise<CareRecord[]> => {
    const petId = filters.petId ?? filters.dogId;
    const response = await apiClient.get('/care', { params: petId ? { petId } : undefined });
    let records: CareRecord[] = (response.data || []).map(mapListItem);

    if (filters.type && filters.type !== 'ALL') {
      records = records.filter(r => r.recordType === filters.type);
    }
    if (filters.recordTypeId) {
      records = records.filter(r => r.recordTypeId === filters.recordTypeId);
    }
    if (filters.keyword?.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      records = records.filter(r => r.title?.toLowerCase().includes(kw) || r.note?.toLowerCase().includes(kw));
    }
    if (filters.startDate) {
      records = records.filter(r => r.recordDate >= filters.startDate!);
    }
    if (filters.endDate) {
      records = records.filter(r => r.recordDate <= filters.endDate!);
    }
    return records;
  },

  getRecordDetail: async (recordId: string | number): Promise<CareRecord> => {
    const response = await apiClient.get(`/care/${recordId}`);
    return mapDetail(response.data);
  },

  createRecord: async (payload: CareRecordCreateRequest) => {
    const response = await apiClient.post('/care', toCarePayload(payload));
    return mapDetail(response.data);
  },

  updateRecord: async (recordId: string | number, payload: CareRecordCreateRequest) => {
    const response = await apiClient.put(`/care/${recordId}`, toCarePayload(payload));
    return mapDetail(response.data);
  },

  deleteRecord: async (recordId: string | number) => {
    return apiClient.delete(`/care/${recordId}`);
  },

  // 연관 진료 기록 후보 조회 (지출 기록 등록용). 백엔드는 키워드 검색을 지원하지 않아 프런트에서 필터링합니다.
  getMedicalRecordCandidates: async (dogId: string | number, keyword?: string): Promise<CareRecord[]> => {
    const response = await apiClient.get(`/care/medical-candidates`, { params: { petId: dogId } });
    let records: CareRecord[] = (response.data || []).map(mapListItem);
    if (keyword?.trim()) {
      const kw = keyword.trim().toLowerCase();
      records = records.filter(r => r.title?.toLowerCase().includes(kw));
    }
    return records;
  },

  // 증상 마스터 목록 검색 (자동완성용)
  searchSymptomMasters: async (keyword: string): Promise<string[]> => {
    const response = await apiClient.get('/symptoms/search', {
      params: { keyword }
    });
    const symptomList = response.data || [];
    return symptomList.map((item: { id: number; name: string }) => item.name);
  },
};

function toCarePayload(payload: CareRecordCreateRequest) {
  const medical = payload.medicalDetail ?? payload.medicalDetails;
  const expense = payload.expenseDetail ?? payload.expenseDetails;

  return {
    petId: payload.petId ?? payload.dogId,
    recordType: recordTypeCodeOf(payload.recordTypeId, payload.recordType),
    recordDate: payload.recordDate,
    title: payload.title,
    note: payload.note,
    sourceScheduleId: payload.sourceScheduleId || null,
    medicalDetail: medical ? {
      clinicName: medical.clinicName,
      symptoms: medical.symptoms,
      symptomTags: medical.symptomTags,
      diagnosis: medical.diagnosis,
      treatment: medical.treatment,
      medicationStartDate: medical.medicationStartDate,
      medicationDays: medical.medicationDays,
      amount: medical.amount,
    } : null,
    expenseDetail: expense ? {
      category: categoryCodeOf(expense.categoryId, expense.category),
      amount: expense.amount,
      memo: expense.memo,
      relatedMedicalRecordId: expense.relatedMedicalRecordId || null,
    } : null,
  };
}
