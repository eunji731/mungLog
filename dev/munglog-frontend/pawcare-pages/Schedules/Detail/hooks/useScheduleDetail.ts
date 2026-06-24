import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '@/api/scheduleApi';
import { fileApi } from '@/api/fileApi';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import type { Schedule } from '@/types/schedule';
import type { FileItem } from '@/types/file';

export const useScheduleDetail = (id?: string) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { codes: targetTypeCodes } = useCommonCodes('FILE_TARGET_TYPE');

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. 일정 상세 정보 조회
      const scheduleData = await scheduleApi.getScheduleDetail(id);
      setSchedule(scheduleData);

      // 2. 공통 코드 기반 파일 조회
      if (targetTypeCodes.length > 0) {
        const found = targetTypeCodes.find(c => c.code === 'SCHEDULE');
        if (found) {
          const scheduleFiles = await fileApi.getFiles(found.id, id);
          setFiles(scheduleFiles);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch schedule detail:', err);
      setError('일정 정보를 불러오는데 실패했습니다.');
      
      // 403/404 시 Mock 데이터 폴백 (개발용)
      if (!err.response || err.response.status === 403 || err.response.status === 404) {
        const mock: Schedule = {
          id,
          dogId: 'mock-pet',
          dogName: '봉봉',
          title: '튼튼동물병원 피부염 재진',
          scheduleDate: '2026-04-04T14:00:00',
          scheduleTypeCode: 'MEDICAL',
          isCompleted: false,
          memo: '지난번 약 먹고 구토한 증상 원장님께 꼭 여쭤보기. \n사료 바꾼 것도 말씀드려야 함.',
          symptomTags: ['피부염', '구토', '가려움'],
          dDay: 3
        };
        setSchedule(mock);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, targetTypeCodes]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { schedule, files, isLoading, error, refetch: fetchDetail };
};
