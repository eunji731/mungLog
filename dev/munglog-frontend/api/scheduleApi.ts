import { apiClient } from '@/lib/apiClient';
import { SCHEDULE_TYPE_CODES } from '@/lib/codeGroups';
import type { Schedule, ScheduleFilters, ScheduleCreateRequest, ScheduleStreak } from '@/types/schedule';

interface BackendScheduleResponse {
  id: string;
  petId: string;
  petName: string;
  scheduleType: string;
  isCompleted: boolean;
  title: string;
  scheduleDate: string;
  memo?: string;
  location?: string;
  dDay: number;
  attachmentCount: number;
  symptomTags: string[];
  inventoryItemId?: string;
  inventoryItemName?: string;
  inventoryItemStock?: number;
}

const scheduleTypeIdOf = (code?: string) => SCHEDULE_TYPE_CODES.find(c => c.code === code)?.id;
const scheduleTypeCodeOf = (id?: number, fallbackCode?: string) =>
  fallbackCode || SCHEDULE_TYPE_CODES.find(c => c.id === id)?.code || 'ETC';

function mapSchedule(raw: BackendScheduleResponse): Schedule {
  return {
    id: raw.id,
    dogId: raw.petId,
    petId: raw.petId,
    dogName: raw.petName,
    petName: raw.petName,
    dogProfileImageUrl: null,
    title: raw.title,
    location: raw.location,
    scheduleDate: raw.scheduleDate,
    scheduleType: raw.scheduleType,
    scheduleTypeCode: raw.scheduleType,
    scheduleTypeId: scheduleTypeIdOf(raw.scheduleType),
    isCompleted: raw.isCompleted,
    memo: raw.memo,
    symptomTags: raw.symptomTags || [],
    dDay: raw.dDay,
    inventoryItemId: raw.inventoryItemId,
    inventoryItemName: raw.inventoryItemName,
    inventoryItemStock: raw.inventoryItemStock,
  };
}

export const scheduleApi = {
  // 백엔드는 petId 필터만 지원하므로, 나머지(type/keyword/날짜)는 프런트에서 필터링합니다.
  getSchedules: async (filters: ScheduleFilters): Promise<Schedule[]> => {
    const petId = filters.petId ?? filters.dogId;
    const response = await apiClient.get('/schedules', { params: petId ? { petId } : undefined });
    let schedules: Schedule[] = (response.data || []).map(mapSchedule);

    if (filters.type && filters.type !== 'ALL') {
      schedules = schedules.filter(s => s.scheduleTypeCode === filters.type || s.scheduleTypeId === filters.type);
    }
    if (filters.keyword?.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      schedules = schedules.filter(s => s.title?.toLowerCase().includes(kw) || s.memo?.toLowerCase().includes(kw));
    }
    if (filters.startDate) {
      schedules = schedules.filter(s => s.scheduleDate >= filters.startDate!);
    }
    if (filters.endDate) {
      const endBound = `${filters.endDate}T23:59:59`;
      schedules = schedules.filter(s => s.scheduleDate <= endBound);
    }
    return schedules;
  },

  getScheduleDetail: async (id: string | number): Promise<Schedule> => {
    const response = await apiClient.get(`/schedules/${id}`);
    return mapSchedule(response.data);
  },

  createSchedule: async (payload: ScheduleCreateRequest) => {
    const response = await apiClient.post('/schedules', toSchedulePayload(payload));
    return mapSchedule(response.data);
  },

  updateSchedule: async (id: string | number, payload: ScheduleCreateRequest) => {
    const response = await apiClient.put(`/schedules/${id}`, toSchedulePayload(payload));
    return mapSchedule(response.data);
  },

  deleteSchedule: async (id: string | number) => {
    return apiClient.delete(`/schedules/${id}`);
  },

  toggleCompletion: async (id: string | number) => {
    const response = await apiClient.patch(`/schedules/${id}/completion`);
    return mapSchedule(response.data);
  },

  // 일정 -> 케어기록으로 전환 (백엔드가 직접 케어기록을 생성하고 새 ID를 돌려줍니다)
  convertToCareRecord: async (id: string | number): Promise<string> => {
    const response = await apiClient.post(`/schedules/${id}/convert`);
    return response.data;
  },

  // 같은 제목으로 2회 이상 등록된 반복 일정의 완료 스트릭 조회
  getStreaks: async (petId?: string): Promise<ScheduleStreak[]> => {
    const response = await apiClient.get('/schedules/streaks', { params: petId ? { petId } : undefined });
    return response.data || [];
  }
};

function toSchedulePayload(payload: ScheduleCreateRequest) {
  return {
    petId: payload.petId ?? payload.dogId,
    scheduleType: scheduleTypeCodeOf(payload.scheduleTypeId, payload.scheduleType),
    scheduleDate: payload.scheduleDate,
    title: payload.title,
    memo: payload.memo,
    location: payload.location,
    symptomTags: payload.symptomTags,
    inventoryItemId: payload.inventoryItemId,
  };
}
