import { useState } from 'react';
import { usePet } from '@/app/common/hooks/usePet';

export const useDogList = () => {
  const { pets: dogs, loading: isLoading, fetchPets } = usePet();
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = async () => {
    try {
      setError(null);
      await fetchPets();
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오지 못했습니다.');
    }
  };

  return { dogs, isLoading, error, refetch: fetchDogs };
};
