import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '@/api/scheduleApi';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import type { Schedule, ScheduleFilters } from '@/types/schedule';

export const useSchedules = () => {
  const { selectedPetId } = usePet();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ScheduleFilters>({
    type: 'ALL'
  });

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const petId = selectedPetId && selectedPetId !== ALL_PETS_ID ? selectedPetId : undefined;
      const data = await scheduleApi.getSchedules({ ...filters, petId });
      setSchedules(data);
    } catch (err: unknown) {
      console.error('Failed to fetch schedules:', err);
      setSchedules([]); // 에러 시 빈 배열로 초기화
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedPetId]);

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
