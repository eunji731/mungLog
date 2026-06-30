import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { scheduleApi } from '@/api/scheduleApi';
import { usePet, usePetStore, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import type { Schedule, ScheduleFilters } from '@/types/schedule';

export const useSchedules = () => {
  const { selectedPetId } = usePet();
  const groupVersion = usePetStore((s) => s.groupVersion);
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') || 'ALL';

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ScheduleFilters>({
    type: initialType
  });

  const typeParam = searchParams?.get('type');
  useEffect(() => {
    if (typeParam) {
      setFilters(prev => ({ ...prev, type: typeParam }));
    }
  }, [typeParam]);

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const petId = selectedPetId && selectedPetId !== ALL_PETS_ID ? selectedPetId : undefined;
      const data = await scheduleApi.getSchedules({ ...filters, petId });
      setSchedules(data);
    } catch (err: unknown) {
      console.error('Failed to fetch schedules:', err);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedPetId, groupVersion]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const updateFilter = useCallback((newFilters: Partial<ScheduleFilters>) => {
    setFilters(prev => {
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
