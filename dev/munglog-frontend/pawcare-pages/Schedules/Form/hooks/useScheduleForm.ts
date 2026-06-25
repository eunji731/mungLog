import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleApi } from '@/api/scheduleApi';
import { fileApi } from '@/api/fileApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/context/ToastContext';
import { usePet } from '@/app/common/hooks/usePet';

export const useScheduleForm = (id?: string, options?: { prefillDate?: string }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const { pets: dogs } = usePet();

  const [formData, setFormData] = useState({
    dogId: '',
    title: '',
    location: '',
    scheduleDate: options?.prefillDate || new Date().toISOString().split('T')[0],
    scheduleTime: '10:00',
    scheduleTypeId: 0 as number,
    memo: '',
    symptomTags: [] as string[]
  });

  const fileUploader = useFileUpload('SCHEDULE');
  const fileLoadedRef = useRef(false);

  // 1. 상세 데이터 본문 로드
  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setIsFetching(true);
        const data = await scheduleApi.getScheduleDetail(id);
        
        const fullDate = data.scheduleDate;
        const [date, time] = fullDate.includes('T') 
          ? fullDate.split('T') 
          : [fullDate, '10:00'];

        setFormData({
          dogId: (data.dogId ?? data.petId ?? '').toString(),
          title: data.title,
          location: data.location || '',
          scheduleDate: date,
          scheduleTime: time.substring(0, 5),
          scheduleTypeId: data.scheduleTypeId || 0,
          memo: data.memo || '',
          symptomTags: data.symptomTags || []
        });

        if (!fileLoadedRef.current) {
          fileLoadedRef.current = true;
          const files = await fileApi.getFiles('SCHEDULE', id);
          if (files.length > 0) fileUploader.setInitialFiles(files);
        }
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        router.push('/schedules');
      } finally {
        setIsFetching(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!formData.dogId) return showToast('반려견을 선택해주세요.', 'warning');
    if (!formData.title.trim()) return showToast('제목을 입력해주세요.', 'warning');
    if (!formData.scheduleTypeId) return showToast('일정 유형을 선택해주세요.', 'warning');

    try {
      setIsLoading(true);

      const payload = {
        dogId: formData.dogId,
        title: formData.title.trim(),
        location: formData.location.trim() || undefined,
        scheduleDate: `${formData.scheduleDate}T${formData.scheduleTime}:00`,
        scheduleTypeId: Number(formData.scheduleTypeId),
        memo: formData.memo.trim() || undefined,
        symptomTags: formData.symptomTags,
      };

      const saved = id
        ? await scheduleApi.updateSchedule(id, payload)
        : await scheduleApi.createSchedule(payload);

      if (fileUploader.localFiles.length > 0) {
        await fileUploader.syncToServer(saved.id);
      }

      if (id) {
        showToast('일정이 수정되었습니다! ✨', 'success');
        router.push(`/schedules/${id}`); // 수정 시 상세로 이동
      } else {
        showToast('일정이 예약되었습니다! ✨', 'success');
        router.push('/schedules');
      }
    } catch (err) {
      console.error('Save failed:', err);
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    dogs,
    fileUploader,
    handleSave,
    isLoading,
    isFetching
  };
};
