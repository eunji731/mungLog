import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleApi } from '@/api/scheduleApi';
import { dogApi } from '@/api/dogApi';
import { fileApi } from '@/api/fileApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { useToast } from '@/context/ToastContext';
import type { Dog } from '@/types/dog';

export const useScheduleForm = (id?: string) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const { codes: targetTypeCodes } = useCommonCodes('FILE_TARGET_TYPE');

  const [formData, setFormData] = useState({
    dogId: '',
    title: '',
    location: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    scheduleTime: '10:00',
    scheduleTypeId: 0 as number,
    memo: '',
    symptomTags: [] as string[]
  });

  const fileUploader = useFileUpload('SCHEDULE');
  const fileLoadedRef = useRef(false);

  useEffect(() => {
    dogApi.getDogs().then(setDogs).catch(() => setDogs([]));
  }, []);

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
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        navigate('/schedules');
      } finally {
        setIsFetching(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // 2. 공통코드가 준비되면 파일 정보를 별도로 가져옴 (무한루프 방지)
  useEffect(() => {
    if (!id || targetTypeCodes.length === 0 || fileLoadedRef.current) return;

    const fetchFiles = async () => {
      const found = targetTypeCodes.find(c => c.code === 'SCHEDULE');
      if (found && found.id) {
        try {
          const files = await fileApi.getFiles(found.id, id);
          if (files && files.length > 0) {
            fileUploader.setInitialFiles(files);
            fileLoadedRef.current = true;
          }
        } catch (err) {
          console.error('Failed to load files:', err);
        }
      }
    };
    fetchFiles();
  }, [id, targetTypeCodes, fileUploader]);

  const handleSave = async () => {
    if (!formData.dogId) return showToast('반려견을 선택해주세요.', 'warning');
    if (!formData.title.trim()) return showToast('제목을 입력해주세요.', 'warning');
    if (!formData.scheduleTypeId) return showToast('일정 유형을 선택해주세요.', 'warning');

    try {
      setIsLoading(true);

      let uploadedFileIds: Array<string | number> = [];
      if (fileUploader.localFiles.length > 0) {
        const uploadedFiles = await fileUploader.upload(id ?? null);
        if (uploadedFiles) {
          uploadedFileIds = uploadedFiles.map(f => f.id);
        }
      }

      const combinedFileIds = [...fileUploader.existingFileIds, ...uploadedFileIds];

      const payload = {
        dogId: formData.dogId,
        title: formData.title.trim(),
        location: formData.location.trim() || undefined,
        scheduleDate: `${formData.scheduleDate}T${formData.scheduleTime}:00`,
        scheduleTypeId: Number(formData.scheduleTypeId),
        memo: formData.memo.trim() || undefined,
        symptomTags: formData.symptomTags,
        fileIds: combinedFileIds.length > 0 ? combinedFileIds : undefined
      };

      if (id) {
        await scheduleApi.updateSchedule(id, payload);
        showToast('일정이 수정되었습니다! ✨', 'success');
        navigate(`/schedules/${id}`); // 수정 시 상세로 이동
      } else {
        await scheduleApi.createSchedule(payload);
        showToast('일정이 예약되었습니다! ✨', 'success');
        navigate('/schedules');
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
