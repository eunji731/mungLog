/**
 * 백엔드에는 범용 코드 테이블(API)이 없고, 실제로는 도메인별 enum(CareRecordType, ScheduleType)으로
 * 값이 고정되어 있습니다. 프런트는 화면에서 id 기반 선택 UI를 쓰기 위해 이 enum 값들을 정적으로
 * 미러링합니다. EXPENSE_CATEGORY는 백엔드에 enum이 없는 자유 문자열 필드라 임의로 정의합니다.
 */

export interface StaticCodeItem {
  id: number;
  code: string;
  codeName: string;
  sortOrder: number;
}

// com.munglog.backend.domain.care.domain.CareRecordType 과 1:1로 매핑
export const RECORD_TYPE_CODES: StaticCodeItem[] = [
  { id: 1, code: 'HOSPITAL', codeName: '병원/진료', sortOrder: 1 },
  { id: 2, code: 'MEDICINE', codeName: '투약', sortOrder: 2 },
  { id: 3, code: 'GROOMING', codeName: '미용', sortOrder: 3 },
  { id: 4, code: 'VACCINATION', codeName: '예방접종', sortOrder: 4 },
  { id: 5, code: 'CHECKUP', codeName: '건강검진', sortOrder: 5 },
  { id: 6, code: 'EXPENSE', codeName: '지출', sortOrder: 6 },
  { id: 7, code: 'ETC', codeName: '기타', sortOrder: 7 },
];

// com.munglog.backend.domain.schedule.domain.ScheduleType 과 1:1로 매핑
export const SCHEDULE_TYPE_CODES: StaticCodeItem[] = [
  { id: 1, code: 'HOSPITAL', codeName: '병원', sortOrder: 1 },
  { id: 2, code: 'GROOMING', codeName: '미용', sortOrder: 2 },
  { id: 3, code: 'VACCINATION', codeName: '예방접종', sortOrder: 3 },
  { id: 4, code: 'CHECKUP', codeName: '건강검진', sortOrder: 4 },
  { id: 5, code: 'MEDICINE', codeName: '투약', sortOrder: 5 },
  { id: 6, code: 'ETC', codeName: '기타', sortOrder: 6 },
];

// ExpenseDetail.category 는 백엔드에서 자유 문자열이라 프런트에서 자체 정의
export const EXPENSE_CATEGORY_CODES: StaticCodeItem[] = [
  { id: 1, code: 'HOSPITAL', codeName: '병원비', sortOrder: 1 },
  { id: 2, code: 'MEDICINE', codeName: '약/영양제', sortOrder: 2 },
  { id: 3, code: 'GROOMING', codeName: '미용', sortOrder: 3 },
  { id: 4, code: 'FOOD', codeName: '사료/간식', sortOrder: 4 },
  { id: 5, code: 'SUPPLIES', codeName: '용품', sortOrder: 5 },
  { id: 6, code: 'ETC', codeName: '기타', sortOrder: 6 },
];

export const STATIC_CODE_GROUPS: Record<string, StaticCodeItem[]> = {
  RECORD_TYPE: RECORD_TYPE_CODES,
  SCHEDULE_TYPE: SCHEDULE_TYPE_CODES,
  EXPENSE_CATEGORY: EXPENSE_CATEGORY_CODES,
};

// 케어기록 중 "의료" 폼(증상/처방)으로 보여줄 타입. 나머지는 "지출" 폼으로 처리.
const EXPENSE_LIKE_RECORD_TYPES = ['EXPENSE', 'GROOMING', 'ETC'];

export const isMedicalRecordType = (code?: string | null) =>
  !!code && !EXPENSE_LIKE_RECORD_TYPES.includes(code);
