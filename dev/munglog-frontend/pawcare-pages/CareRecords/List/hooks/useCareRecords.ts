import { useState, useEffect, useCallback } from 'react';
import { careApi } from '@/api/careApi';
import type { CareRecord, CareRecordsFilter } from '@/types/care';

export const useCareRecords = () => {
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [calendarRecords, setCalendarRecords] = useState<CareRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<CareRecordsFilter>({
    type: 'ALL'
  });

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 1. 리스트용 데이터 (날짜 필터 포함)
      const listData = await careApi.getRecords(filters);
      setRecords(listData);

      // 2. 달력 마커용 데이터 (날짜 필터 제외)
      // 현재 선택된 강아지, 타입, 키워드는 유지하되 날짜만 전체로 조회
      const calendarFilters = { 
        ...filters, 
        startDate: undefined, 
        endDate: undefined 
      };
      const calendarData = await careApi.getRecords(calendarFilters);
      setCalendarRecords(calendarData);

    } catch (err) {
      console.error('CareRecords Load Failed:', err);
      setRecords([]);
      setCalendarRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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