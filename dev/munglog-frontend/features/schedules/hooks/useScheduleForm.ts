import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleApi } from '@/api/scheduleApi';
import { fileApi } from '@/api/fileApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/app/common/hooks/useToast';
import { usePet } from '@/app/common/hooks/usePet';
import { useInventory } from '@/features/inventory/hooks/useInventory';

export const useScheduleForm = (id?: string, options?: { prefillDate?: string }) => {
  const router = useRouter();
  const { success, error: toastError, warning } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const { pets: dogs, selectedPetId } = usePet();
  const { items: inventoryItems, fetchItems: fetchInventoryItems } = useInventory();

  const [formData, setFormData] = useState({
    dogId: selectedPetId && selectedPetId !== 'ALL' ? selectedPetId.toString() : '',
    title: '',
    location: '',
    scheduleDate: options?.prefillDate || new Date().toISOString().split('T')[0],
    scheduleTime: '10:00',
    scheduleTypeId: 0 as number,
    memo: '',
    symptomTags: [] as string[],
    inventoryItemId: '',
    linkedSymptomSnapId: ''
  });

  useEffect(() => {
    fetchInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          const snapData = localStorage.getItem('munglog_symptom_snaps');
          if (snapData) {
            const snaps = JSON.parse(snapData);
            const found = snaps.find((s: any) => String(s.linkedScheduleId) === String(id));
            if (found) {
              linkedSnapId = found.id;
            }
          }
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
          linkedSymptomSnapId: linkedSnapId
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
      };

      const saved = id
        ? await scheduleApi.updateSchedule(id, payload)
        : await scheduleApi.createSchedule(payload);

      // --- 증상 스냅 연동 처리 ---
      try {
        const snapData = localStorage.getItem('munglog_symptom_snaps');
        if (snapData) {
          let snaps = JSON.parse(snapData);
          const scheduleId = String(saved.id);
          
          // 1. 기존에 이 일정에 연동되어 있던 다른 스냅들은 연동 해제
          snaps = snaps.map((s: any) => {
            if (String(s.linkedScheduleId) === scheduleId) {
              const { linkedScheduleId, linkedScheduleTitle, ...rest } = s;
              return rest;
            }
            return s;
          });

          // 2. 새로 선택된 스냅이 있다면 연동 설정
          if (formData.linkedSymptomSnapId) {
            snaps = snaps.map((s: any) => {
              if (s.id === formData.linkedSymptomSnapId) {
                return {
                  ...s,
                  linkedScheduleId: scheduleId,
                  linkedScheduleTitle: saved.title,
                };
              }
              return s;
            });
          }

          localStorage.setItem('munglog_symptom_snaps', JSON.stringify(snaps));
          window.dispatchEvent(new Event('symptom_snaps_updated'));
        }
      } catch (e) {
        console.error('Failed to link symptom snap to schedule:', e);
      }
      // ----------------------------

      if (fileUploader.localFiles.length > 0) {
        await fileUploader.syncToServer(saved.id);
      }

      if (id) {
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
