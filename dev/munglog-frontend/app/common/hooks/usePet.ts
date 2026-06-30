'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/apiClient';

export interface PetProfile {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  adoptionDate?: string;
  gender: 'MALE' | 'FEMALE';
  weightKg?: number;
  photo: string;
  traits: string;
  appearance?: string;
  likes?: string;
  dislikes?: string;
  diaryTone?: string;
  registrationNumber?: string;
  isNeutered?: boolean;
  memo?: string;
  isActive: boolean;
  addedAt: string;
}

export type PetFormData = Omit<PetProfile, 'id' | 'addedAt' | 'photo' | 'isActive'>;

// 백엔드 PetResponse 응답 형태 (photo 대신 profileImageUrl로 내려옴)
interface PetResponseDto extends Omit<PetProfile, 'photo' | 'isActive' | 'addedAt'> {
  profileImageUrl: string | null;
  isNeutered: boolean;
  memo?: string;
}

const mapPetResponse = (dto: PetResponseDto): PetProfile => ({
  ...dto,
  photo: dto.profileImageUrl ?? '',
  isNeutered: dto.isNeutered ?? false,
  isActive: true,
  addedAt: '',
});

// 백엔드 PetController는 멀티파트(data: JSON Blob + profileImage: File)만 받음
const toPetFormData = (data: Partial<PetFormData>, photo?: File | null): FormData => {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photo) formData.append('profileImage', photo);
  return formData;
};

export const ALL_PETS_ID = 'ALL';

interface PetState {
  pets: PetProfile[];
  selectedPetId: string | typeof ALL_PETS_ID | null;
  groupVersion: number;
  loading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  setSelectedPetId: (id: string | typeof ALL_PETS_ID | null) => void;
  addPet: (data: PetFormData, photo?: File | null) => Promise<PetProfile>;
  updatePet: (id: string, data: Partial<PetFormData>, photo?: File | null) => Promise<PetProfile>;
  removePet: (id: string) => Promise<void>;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      selectedPetId: ALL_PETS_ID, // 기본값을 'ALL'로 변경
      groupVersion: 0,
      loading: false,
      error: null,

      fetchPets: async () => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.get<PetResponseDto[]>('/pets');
          const pets = res.data.map(mapPetResponse);
          set({ pets, loading: false });
          
          // selectedPetId가 null이거나, ALL이 아닌데 목록에도 없으면 ALL로 초기화
          const currentId = get().selectedPetId;
          if (!currentId || (currentId !== ALL_PETS_ID && !pets.find(p => p.id === currentId))) {
            set({ selectedPetId: ALL_PETS_ID });
          }
        } catch (err: any) {
          set({ pets: [], error: err.response?.data?.message || err.message, loading: false });
        }
      },

      setSelectedPetId: (id) => set({ selectedPetId: id }),

      addPet: async (data, photo) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.post<PetResponseDto>(
            '/pets',
            toPetFormData(data, photo),
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          const pet = mapPetResponse(res.data);
          set((state) => ({ pets: [...state.pets, pet], loading: false }));
          return pet;
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false });
          throw err;
        }
      },

      updatePet: async (id, data, photo) => {
        set({ loading: true, error: null });
        try {
          const res = await apiClient.put<PetResponseDto>(
            `/pets/${id}`,
            toPetFormData(data, photo),
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          const pet = mapPetResponse(res.data);
          set((state) => ({
            pets: state.pets.map((p) => (p.id === id ? pet : p)),
            loading: false,
          }));
          return pet;
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false });
          throw err;
        }
      },

      removePet: async (id) => {
        set({ loading: true, error: null });
        try {
          await apiClient.delete(`/pets/${id}`);
          const newPets = get().pets.filter((p) => p.id !== id);
          set({ pets: newPets, loading: false });
          
          if (get().selectedPetId === id) {
            set({ selectedPetId: newPets.length > 0 ? newPets[0].id : null });
          }
        } catch (err: any) {
          set({ error: err.response?.data?.message || err.message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'pet-storage',
      partialize: (state) => ({ selectedPetId: state.selectedPetId }),
    }
  )
);

export const usePet = () => usePetStore();
