'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { usePetStore, ALL_PETS_ID } from '@/app/common/hooks/usePet';

export interface MapMemory {
  photoId: string;
  path: string;
  takenAt?: string;
  latitude: number;
  longitude: number;
  moment: {
    id: string;
    aiTitle?: string;
    category?: string;
    locationName?: string;
    aiDiary?: string;
  };
  dailyLog: {
    id: string;
    dateKey: string;
    aiTitle?: string;
  };
}

export function useMapMemories() {
  const [memories, setMemories] = useState<MapMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedPetId } = usePetStore();

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (selectedPetId && selectedPetId !== ALL_PETS_ID) {
          params.petId = selectedPetId;
        }
        const res = await apiClient.get<MapMemory[]>('/map/memories', { params });
        setMemories(res.data ?? []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [selectedPetId]);

  return { memories, loading, error };
}
