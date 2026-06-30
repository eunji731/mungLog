import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { scheduleApi } from '@/api/scheduleApi';
import { fileApi } from '@/api/fileApi';
import { symptomSnapApi } from '@/api/symptomSnapApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/app/common/hooks/useToast';
import { usePet } from '@/app/common/hooks/usePet';
import { useInventory } from '@/features/inventory/hooks/useInventory';

export const useScheduleForm = (
  id?: string,
  options?: {
    prefillDate?: string;
    onSaveSuccess?: () => void;
  }
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError, warning } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const { pets: dogs, selectedPetId } = usePet();
  const { items: inventoryItems, fetchItems: fetchInventoryItems } = useInventory();

  // URL에서 초기 파라미터 추출
  const paramDogId = searchParams?.get('dogId') || searchParams?.get('petId') || '';
  const paramTitle = searchParams?.get('title') || '';
  const paramScheduleTypeId = searchParams?.get('scheduleTypeId') ? Number(searchParams.get('scheduleTypeId')) : 0;
  const paramVaccinationTypeId = searchParams?.get('vaccinationTypeId') ? Number(searchParams.get('vaccinationTypeId')) : null;
  const paramDate = searchParams?.get('date') || options?.prefillDate || '';

  const [formData, setFormData] = useState({
    dogId: paramDogId || (selectedPetId && selectedPetId !== 'ALL' ? selectedPetId.toString() : ''),
    title: paramTitle,
    location: '',
    scheduleDate: paramDate || new Date().toISOString().split('T')[0],
    scheduleTime: '10:00',
    scheduleTypeId: paramScheduleTypeId,
    memo: '',
    symptomTags: [] as string[],
    inventoryItemId: '',
    linkedSymptomSnapId: '',
    vaccinationTypeId: paramVaccinationTypeId,
  });

  useEffect(() => {
    fetchInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zustand persist 재수화 후 selectedPetId가 늦게 반영되는 경우 동기화 (신규 등록 시만)
  useEffect(() => {
    if (!id && !paramDogId && selectedPetId && selectedPetId !== 'ALL') {
      setFormData(prev => prev.dogId ? prev : { ...prev, dogId: selectedPetId.toString() });
    }
  }, [selectedPetId, id, paramDogId]);

  const fileUploader = useFileUpload('SCHEDULE');
  const fileLoadedRef = useRef(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const petId = formData.dogId || undefined;
    const inventoryNames = inventoryItems.map(i => i.name?.trim()).filter(Boolean) as string[];
    scheduleApi.getSchedules({ petId })
      .then((list) => {
        const scheduleTitles = list.map(s => s.title?.trim()).filter(Boolean) as string[];
        setTitleSuggestions(Array.from(new Set([...inventoryNames, ...scheduleTitles])));
      })
      .catch((err) => console.error('Failed to fetch title suggestions:', err));
  }, [formData.dogId, inventoryItems]);

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

        let linkedSnapId = '';
        try {
          const snaps = await symptomSnapApi.getSnaps();
          const found = snaps.find(s => s.linkedScheduleId === String(id));
          if (found) linkedSnapId = found.id;
        } catch (e) {
          console.error('Failed to load linked snap id', e);
        }

        setFormData({
          dogId: (data.dogId ?? data.petId ?? '').toString(),
          title: data.title,
          location: data.location || '',
          scheduleDate: date,
          scheduleTime: time.substring(0, 5),
          scheduleTypeId: data.scheduleTypeId || 0,
          memo: data.memo || '',
          symptomTags: data.symptomTags || [],
          inventoryItemId: data.inventoryItemId || '',
          linkedSymptomSnapId: linkedSnapId,
          vaccinationTypeId: data.vaccinationTypeId ?? null,
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
    if (!formData.dogId) return warning('반려견을 선택해주세요.');
    if (!formData.title.trim()) return warning('제목을 입력해주세요.');
    if (!formData.scheduleTypeId) return warning('일정 유형을 선택해주세요.');

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
        inventoryItemId: formData.inventoryItemId || undefined,
        vaccinationTypeId: formData.vaccinationTypeId ?? null,
      };

      const saved = id
        ? await scheduleApi.updateSchedule(id, payload)
        : await scheduleApi.createSchedule(payload);

      // --- 증상 스냅 연동 처리 ---
      try {
        const scheduleId = String(saved.id);
        const allSnaps = await symptomSnapApi.getSnaps();
        const currentLinked = allSnaps.filter(s => s.linkedScheduleId === scheduleId);

        // 1. 기존 연동 스냅 중 새로 선택된 것과 다른 스냅은 해제
        for (const s of currentLinked) {
          if (s.id !== formData.linkedSymptomSnapId) {
            await symptomSnapApi.unlinkSchedule(s.id);
          }
        }

        // 2. 새로 선택된 스냅이 있고 아직 연동 안 됐으면 연동
        if (formData.linkedSymptomSnapId) {
          const alreadyLinked = currentLinked.some(s => s.id === formData.linkedSymptomSnapId);
          if (!alreadyLinked) {
            await symptomSnapApi.linkSchedule(formData.linkedSymptomSnapId, scheduleId);
          }
        }
      } catch (e) {
        console.error('Failed to link symptom snap to schedule:', e);
      }
      // ----------------------------

      if (fileUploader.localFiles.length > 0) {
        await fileUploader.syncToServer(saved.id);
      }

      if (options?.onSaveSuccess) {
        options.onSaveSuccess();
      } else if (id) {
        success('일정이 수정되었습니다! ✨');
        router.push(`/schedules/${id}`);
      } else {
        success('일정이 예약되었습니다! ✨');
        router.push('/schedules');
      }
    } catch (err) {
      console.error('Save failed:', err);
      toastError('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    dogs,
    inventoryItems,
    fileUploader,
    handleSave,
    isLoading,
    isFetching,
    titleSuggestions
  };
};
