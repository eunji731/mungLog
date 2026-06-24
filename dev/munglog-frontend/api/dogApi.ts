import { apiClient } from '@/lib/apiClient';
import type { Dog, DogCreateRequest, DogUpdateRequest } from '@/types/dog';

export const dogApi = {
  // 목록 조회
  getDogs: async () => {
    const { data } = await apiClient.get<Dog[]>('/pets');
    return data || [];
  },

  // 단일 조회
  getDogById: async (id: string | number) => {
    const { data } = await apiClient.get<Dog[]>('/pets');
    const dog = data.find((item) => item.id === String(id));
    if (!dog) throw new Error('반려동물 정보를 찾을 수 없습니다.');
    return dog;
  },

  createDog: async (payload: DogCreateRequest, profileImage?: File | null) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(toPetPayload(payload))], { type: 'application/json' }));
    if (profileImage) formData.append('profileImage', profileImage);
    return apiClient.post('/pets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  updateDog: async (id: string | number, payload: DogUpdateRequest, profileImage?: File | null) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(toPetPayload(payload))], { type: 'application/json' }));
    if (profileImage) formData.append('profileImage', profileImage);
    return apiClient.put(`/pets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  deleteDog: async (id: string | number) => {
    return apiClient.delete(`/pets/${id}`);
  },
};

function toPetPayload(payload: DogCreateRequest | DogUpdateRequest) {
  return {
    name: payload.name,
    breed: payload.breed,
    birthDate: payload.birthDate,
    adoptionDate: payload.adoptionDate ?? null,
    gender: payload.gender ?? 'UNKNOWN',
    weightKg: payload.weightKg ?? payload.weight,
    traits: payload.traits ?? null,
    appearance: payload.appearance ?? null,
    likes: payload.likes ?? null,
    dislikes: payload.dislikes ?? null,
    diaryTone: payload.diaryTone ?? null,
  };
}
