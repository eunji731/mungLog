import { useState, useEffect, useCallback } from 'react';
import { careApi } from '@/api/careApi';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import type { CareRecord, CareRecordsFilter } from '@/types/care';

export const useCareRecords = () => {
  const { selectedPetId } = usePet();
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [calendarRecords, setCalendarRecords] = useState<CareRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<CareRecordsFilter>({
    type: 'ALL'
  });

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const petId = selectedPetId && selectedPetId !== ALL_PETS_ID ? selectedPetId : undefined;

      // 1. 리스트용 데이터 (날짜 필터 포함)
      const listData = await careApi.getRecords({ ...filters, petId });
      setRecords(listData);

      // 2. 달력 마커용 데이터 (날짜 필터 제외, 캘린더 메뉴에서 사용)
      const calendarData = await careApi.getRecords({ ...filters, petId, startDate: undefined, endDate: undefined });
      setCalendarRecords(calendarData);
    } catch (err) {
      console.error('CareRecords Load Failed:', err);
      setRecords([]);
      setCalendarRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedPetId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const updateFilter = useCallback((newFilters: Partial<CareRecordsFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    records,
    calendarRecords,
    isLoading,
    filters,
    updateFilter,
    refetch: fetchRecords
  };
};