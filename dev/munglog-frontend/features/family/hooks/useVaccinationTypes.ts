import { useState, useEffect, useCallback } from 'react';
import { vaccinationTypeApi } from '@/api/vaccinationTypeApi';
import type { VaccinationType } from '@/types/vaccination';

export const useVaccinationTypes = () => {
  const [types, setTypes] = useState<VaccinationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vaccinationTypeApi.getActiveTypes();
      setTypes(data);
    } catch (err) {
      console.error('접종종류 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const createType = async (name: string, intervalDays?: number | null): Promise<VaccinationType> => {
    const created = await vaccinationTypeApi.createType({ name, intervalDays });
    setTypes(prev => [...prev, created]);
    return created;
  };

  return { types, isLoading, refetch: fetchTypes, createType };
};
