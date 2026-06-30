import { useEffect } from 'react';
import { STATIC_CODE_GROUPS, EXPENSE_CATEGORY_CODES, type StaticCodeItem } from '@/lib/codeGroups';
import { useCategoryStore } from '@/hooks/useCategoryStore';

export type CodeItem = StaticCodeItem;

export const useCommonCodes = (groupCode: string) => {
  const { careCategories, scheduleCategories, isLoaded, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  let codes: StaticCodeItem[];
  if (groupCode === 'RECORD_TYPE') {
    codes = careCategories;
  } else if (groupCode === 'SCHEDULE_TYPE') {
    codes = scheduleCategories;
  } else if (groupCode === 'EXPENSE_CATEGORY') {
    codes = EXPENSE_CATEGORY_CODES;
  } else {
    codes = STATIC_CODE_GROUPS[groupCode] || [];
  }

  const findIdByCode = (codeValue: string) =>
    codes.find(c => c.code === codeValue)?.id;

  const getCodeName = (codeValue: string) =>
    codes.find(c => c.code === codeValue)?.codeName || codeValue;

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
    isLoading: !isLoaded,
    getCodeName,
    findIdByCode,
    getCodeNameById,
    getCodeById,
  };
};
