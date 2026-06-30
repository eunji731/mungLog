export type ScheduleType = 'HOSPITAL' | 'GROOMING' | 'VACCINATION' | 'CHECKUP' | 'MEDICINE' | 'ETC' | 'MEDICAL' | 'MEDICATION';

export interface Schedule {
  id: string;
  dogId?: string;
  petId?: string;
  dogName?: string;
  petName?: string;
  dogProfileImageUrl?: string | null; // 추가: 반려견 프로필 이미지 URL
  title: string;
  location?: string;
  scheduleDate: string;
  scheduleType?: ScheduleType | string;
  scheduleTypeCode: string | number;
  scheduleTypeId?: number;
  isCompleted: boolean;
  memo?: string;
  symptomTags: string[];
  dDay: number;
  inventoryItemId?: string;
  inventoryItemName?: string;
  inventoryItemStock?: number;
  convertedCareRecordId?: string | null;
  vaccinationTypeId?: number | null;
  vaccinationTypeName?: string | null;
  vaccinationIntervalDays?: number | null;
}

export interface ScheduleFilters {
  dogId?: string;
  petId?: string;
  type?: string | number | 'ALL';
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface ScheduleStreakOccurrence {
  scheduleDate: string;
  completed: boolean;
}

export interface ScheduleStreak {
  petId: string;
  petName: string;
  title: string;
  scheduleType: string;
  totalCount: number;
  streakCount: number;
  lastScheduleDate: string;
  lastCompleted: boolean;
  nextSuggestedDate: string | null;
  recentOccurrences: ScheduleStreakOccurrence[];
  inventoryItemId?: string;
  inventoryItemName?: string;
  inventoryItemStock?: number;
  stockDepletionDate?: string;
  lowStockWarning: boolean;
}

export interface ScheduleCreateRequest {
  dogId?: string;
  petId?: string;
  title: string;
  location?: string;
  scheduleDate: string;
  scheduleTypeId?: number; // 백엔드 scheduleTypeId (Long) 필드명과 일치
  scheduleType?: string;
  memo?: string;
  symptomTags?: string[];
  fileIds?: Array<string | number>;
  inventoryItemId?: string;
  vaccinationTypeId?: number | null;
}
