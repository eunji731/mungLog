import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePetStore } from '@/app/common/hooks/usePet';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/app/common/hooks/useToast';

export const useDogForm = (id?: string) => {
  const router = useRouter();
  const { success, error: toastError, warning } = useToast();
  const { pets, fetchPets, addPet, updatePet, removePet } = usePetStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birthDate: '',
    weight: '',
  });
  // PetProfile의 필수 필드 중 이 폼이 직접 다루지 않는 값들(수정 시 기존 값을 보존하기 위함)
  const [hiddenFields, setHiddenFields] = useState<{ gender: 'MALE' | 'FEMALE'; traits: string }>({
    gender: 'MALE',
    traits: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 프로필 사진: 문자열 키 'DOG'만 전달
  const photoUploader = useFileUpload('DOG');

  // ============ 초기 데이터 로드 ============
  useEffect(() => {
    if (isEdit && id) {
      const initData = async () => {
        try {
          setIsFetching(true);
          let pet = pets.find(p => p.id === id);
          if (!pet) {
            await fetchPets();
            pet = usePetStore.getState().pets.find(p => p.id === id);
          }
          if (!pet) throw new Error('반려견 정보를 찾을 수 없습니다.');

          setFormData({
            name: pet.name || '',
            breed: pet.breed || '',
            birthDate: pet.birthDate || '',
            weight: pet.weightKg?.toString() || '',
          });
          setHiddenFields({
            gender: pet.gender,
            traits: pet.traits || '',
          });

          if (pet.photo) {
            const urlParts = pet.photo.split('/');
            const fileName = urlParts[urlParts.length - 1] || 'profile.jpg';

            photoUploader.setInitialFiles([{
              id: 0,
              fileUrl: pet.photo,
              originalFileName: fileName,
              storedFileName: fileName,
              fileSize: 0,
              fileType: 'image/jpeg',
              targetType: '',
              targetId: id,
              createdAt: ''
            }]);
          }
        } catch (err: any) {
          toastError('정보를 불러오지 못했습니다.');
          router.push('/dogs');
        } finally {
          setIsFetching(false);
        }
      };
      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, router]);

  // ============ 저장 ============
  const handleSave = async () => {
    if (!formData.name.trim()) {
      warning('반려견 이름은 필수입니다! 🐾');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        birthDate: formData.birthDate,
        weightKg: formData.weight ? parseFloat(formData.weight) : undefined,
        gender: hiddenFields.gender,
        traits: hiddenFields.traits,
      };

      const newPhoto = photoUploader.localFiles[0] || null;

      if (isEdit && id) {
        await updatePet(id, payload, newPhoto);
      } else {
        await addPet(payload, newPhoto);
      }

      success('성공적으로 저장되었습니다! ✨');
      router.push('/dogs');
    } catch (err: any) {
      console.error('Save Error:', err);
      toastError(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteDog = async () => {
    if (!id || !isEdit) return;
    try {
      setIsLoading(true);
      await removePet(id);
      success('삭제되었습니다.');
      router.push('/dogs');
    } catch (err: any) {
      toastError('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    isFetching,
    handleSave,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleConfirmDeleteDog,
    isEdit,
    photoUploader,
  };
};
