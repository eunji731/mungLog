import { useState, useEffect, useCallback } from 'react';
import { scheduleApi } from '@/api/scheduleApi';
import { fileApi } from '@/api/fileApi';
import type { Schedule } from '@/types/schedule';
import type { FileItem } from '@/types/file';

export const useScheduleDetail = (id?: string) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);

      const scheduleData = await scheduleApi.getScheduleDetail(id);
      setSchedule(scheduleData);

      const scheduleFiles = await fileApi.getFiles('SCHEDULE', id);
      setFiles(scheduleFiles);
    } catch (err: any) {
      console.error('Failed to fetch schedule detail:', err);
      setError('일정 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { schedule, files, isLoading, error, refetch: fetchDetail };
};
