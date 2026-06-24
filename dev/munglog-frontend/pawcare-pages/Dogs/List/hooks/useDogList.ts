import { useState, useEffect } from 'react';
import type { Dog } from '@/types/dog';
import { dogApi } from '@/api/dogApi';

export const useDogList = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = async () => {
    try {
      setIsLoading(true);
      const data = await dogApi.getDogs();
      setDogs(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오지 못했습니다.');
      setDogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  return { dogs, isLoading, error, refetch: fetchDogs };
};
