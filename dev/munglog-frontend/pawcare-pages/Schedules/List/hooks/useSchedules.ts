import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '@/api/scheduleApi';
import type { Schedule, ScheduleFilters } from '@/types/schedule';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ScheduleFilters>({
    type: 'ALL',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await scheduleApi.getSchedules(filters);
      setSchedules(data);
    } catch (err: unknown) {
      console.error('Failed to fetch schedules:', err);
      setSchedules([]); // 에러 시 빈 배열로 초기화
    } finally {
      setIsLoading(false); 
    }
  }, [filters]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const updateFilter = useCallback((newFilters: Partial<ScheduleFilters>) => {
    setFilters(prev => {
      // 새로운 필터 값이 기존과 다를 때만 업데이트하여 무한 루프 방지
      const isChanged = Object.entries(newFilters).some(([key, value]) => prev[key as keyof ScheduleFilters] !== value);
      if (!isChanged) return prev;
      return { ...prev, ...newFilters };
    });
  }, []);

  return {
    schedules,
    isLoading,
    filters,
    updateFilter,
    refetch: fetchSchedules
  };
};
