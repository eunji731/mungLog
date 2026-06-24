export type RecordType = 'HOSPITAL' | 'MEDICINE' | 'GROOMING' | 'VACCINATION' | 'CHECKUP' | 'EXPENSE' | 'ETC' | 'MEDICAL' | 'MEMO';

export interface CareRecord {
  id: string;
  dogId?: string;
  petId?: string;
  dogName?: string;
  petName?: string;
  dogProfileImageUrl: string | null;
  recordType?: RecordType;
  recordTypeId?: number;
  recordDate: string;
  title: string;
  note?: string;
  // Medical Details
  clinicName?: string;
  diagnosis?: string;
  symptoms?: string;
  symptomTags?: string[];
  treatment?: string;
  medicationStatus?: 'NONE' | 'ACTIVE' | 'COMPLETED';
  medicationStartDate?: string | null;
  medicationDays?: number | null;
  // Common / Expense
  categoryCode?: string; // 표시용 코드명 (문자열)
  categoryTypeId?: number; // DB ID
  amount?: number | null;
  // Expense Specific
  relatedMedicalRecordId?: string | null;
  relatedMedicalRecord?: { id: string; title: string; recordDate: string; clinicName?: string } | null;
  // Common
  attachmentCount: number;
}

export interface CareRecordsFilter {
  dogId?: string;
  petId?: string;
  type?: RecordType | 'ALL';
  recordTypeId?: number; // 필터링용 ID 추가
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MedicalDetailRequest {
  clinicName?: string;
  symptoms?: string;
  symptomTags?: string[];
  diagnosis?: string;
  treatment?: string;
  amount?: number | null;
  medicationStartDate?: string | null;
  medicationDays?: number | null;
  isMedicationCompleted?: boolean;
}

export interface ExpenseDetailRequest {
  categoryId?: number; // categoryCode -> categoryId 로 변경
  category?: string;
  amount: number;
  memo?: string;
  relatedMedicalRecordId?: string | null;
}

export interface CareRecordCreateRequest {
  dogId?: string;
  petId?: string;
  recordTypeId?: number; // recordTypeCode -> recordTypeId 로 변경
  recordType?: string;
  recordDate: string;
  title: string;
  note?: string;
  fileIds?: Array<string | number>;
  sourceScheduleId?: string | null;
  medicalDetails?: MedicalDetailRequest | null;
  expenseDetails?: ExpenseDetailRequest | null;
  medicalDetail?: MedicalDetailRequest | null;
  expenseDetail?: ExpenseDetailRequest | null;
}
