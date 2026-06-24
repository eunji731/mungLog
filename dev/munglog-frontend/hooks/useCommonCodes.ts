import { STATIC_CODE_GROUPS, type StaticCodeItem } from '@/lib/codeGroups';

export type CodeItem = StaticCodeItem;

/**
 * 공통 코드를 가져오는 훅.
 *
 * 백엔드에는 RECORD_TYPE/SCHEDULE_TYPE/EXPENSE_CATEGORY 같은 그룹을 위한
 * 범용 코드 API가 없고, 실제 값은 도메인 enum(CareRecordType, ScheduleType)으로
 * 고정되어 있습니다. 그래서 API 호출 없이 lib/codeGroups.ts의 정적 목록을 그대로 반환합니다.
 */
export const useCommonCodes = (groupCode: string) => {
  const codes = STATIC_CODE_GROUPS[groupCode] || [];

  const findIdByCode = (codeValue: string) => {
    return codes.find(c => c.code === codeValue)?.id;
  };

  const getCodeName = (codeValue: string) => {
    return codes.find(c => c.code === codeValue)?.codeName || codeValue;
  };

  const getCodeNameById = (id?: number) => {
    if (!id) return '';
    return codes.find(c => c.id === id)?.codeName || '';
  };

  const getCodeById = (id?: number) => {
    if (!id) return '';
    return codes.find(c => c.id === id)?.code || '';
  };

  return {
    codes,
    isLoading: false,
    getCodeName,
    findIdByCode,
    getCodeNameById,
    getCodeById
  };
};
