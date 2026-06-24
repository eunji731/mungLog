import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dogApi } from '@/api/dogApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/context/ToastContext';
import type { DogCreateRequest } from '@/types/dog';

export const useDogForm = (id?: string) => {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birthDate: '',
    weight: '',
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
          const dogData = await dogApi.getDogById(id);
          setFormData({
            name: dogData.name || '',
            breed: dogData.breed || '',
            birthDate: dogData.birthDate || '',
            weight: dogData.weight?.toString() || '',
          });

          if (dogData.profileImageUrl) {
            const urlParts = dogData.profileImageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1] || 'profile.jpg';

            photoUploader.setInitialFiles([{
              id: 0,
              fileUrl: dogData.profileImageUrl,
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
          showToast('정보를 불러오지 못했습니다.', 'error');
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
      showToast('반려견 이름은 필수입니다! 🐾', 'warning');
      return;
    }

    try {
      setIsLoading(true);

      const dogPayload: DogCreateRequest = {
        name: formData.name.trim(),
        breed: formData.breed.trim() || null,
        birthDate: formData.birthDate || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        profileImageUrl: null,
      };

      const newPhoto = photoUploader.localFiles[0] || null;

      if (isEdit) {
        await dogApi.updateDog(id, dogPayload, newPhoto);
      } else {
        await dogApi.createDog(dogPayload, newPhoto);
      }

      showToast('성공적으로 저장되었습니다! ✨', 'success');
      router.push('/dogs');
    } catch (err: any) {
      console.error('Save Error:', err);
      showToast(err.response?.data?.message || '저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteDog = async () => {
    if (!id || !isEdit) return;
    try {
      setIsLoading(true);
      await dogApi.deleteDog(id);
      showToast('삭제되었습니다.', 'success');
      router.push('/dogs');
    } catch (err: any) {
      showToast('삭제 중 오류가 발생했습니다.', 'error');
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
