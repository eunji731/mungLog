import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '@/api/scheduleApi';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import type { ScheduleStreak } from '@/types/schedule';

export const useScheduleStreaks = () => {
  const { selectedPetId } = usePet();
  const [streaks, setStreaks] = useState<ScheduleStreak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreaks = useCallback(async () => {
    try {
      setIsLoading(true);
      const petId = selectedPetId && selectedPetId !== ALL_PETS_ID ? selectedPetId : undefined;
      const data = await scheduleApi.getStreaks(petId);
      setStreaks(data);
    } catch (err: unknown) {
      console.error('Failed to fetch schedule streaks:', err);
      setStreaks([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  return { streaks, isLoading, refetch: fetchStreaks };
};
