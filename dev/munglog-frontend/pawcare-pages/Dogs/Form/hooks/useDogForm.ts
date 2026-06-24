import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dogApi } from '@/api/dogApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/context/ToastContext';
import type { DogCreateRequest } from '@/types/dog';

export const useDogForm = (id?: string) => {
  const navigate = useNavigate();
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
            // URL에서 실제 파일명을 추출하거나, 최소한 .jpg를 붙여 이미지임을 인식하게 함
            const urlParts = dogData.profileImageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1] || 'profile.jpg';

            photoUploader.setInitialFiles([{
              id: 0,
              fileUrl: dogData.profileImageUrl,
              originalFileName: fileName, // 확장자가 포함되어야 이미지로 인식됨
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
          navigate('/dogs');
        } finally {
          setIsFetching(false);
        }
      };
      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, navigate]);

  // ============ 저장 ============
  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('반려견 이름은 필수입니다! 🐾', 'warning');
      return;
    }

    try {
      setIsLoading(true);

      // 1단계: 신규 파일 업로드 및 ID 확보
      let finalProfileImageUrl: string | null = photoUploader.existingFiles[0]?.fileUrl || null;
      let finalFileId: string | number | null = null;

      if (photoUploader.hasNewFiles) {
        try {
          const uploaded = await photoUploader.upload(id ?? null); 
          if (uploaded && uploaded.length > 0) {
            finalProfileImageUrl = uploaded[0].fileUrl || null;
            finalFileId = uploaded[0].id;
          }
        } catch (uploadErr: any) {
          console.error('파일 업로드 중 오류:', uploadErr);
          showToast(uploadErr.message || '이미지 업로드에 실패했습니다.', 'error');
          return;
        }
      }

      // 2단계: 본문 저장
      const dogPayload: DogCreateRequest = {
        name: formData.name.trim(),
        breed: formData.breed.trim() || null,
        birthDate: formData.birthDate || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        profileImageUrl: finalProfileImageUrl,
        profileImageFileId: finalFileId
      };

      if (isEdit) {
        await dogApi.updateDog(id, dogPayload);
      } else {
        await dogApi.createDog(dogPayload);
      }

      showToast('성공적으로 저장되었습니다! ✨', 'success');
      navigate('/dogs');
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
      navigate('/dogs');
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
