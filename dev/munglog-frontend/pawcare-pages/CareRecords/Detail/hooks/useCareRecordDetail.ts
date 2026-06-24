import { useState, useEffect, useCallback } from 'react';
import { careApi } from '@/api/careApi';
import { fileApi } from '@/api/fileApi';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import type { CareRecord } from '@/types/care';
import type { FileItem } from '@/types/file';

export const useCareRecordDetail = (id: string | undefined) => {
  const [record, setRecord] = useState<CareRecord | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { codes: targetTypeCodes } = useCommonCodes('FILE_TARGET_TYPE');

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. 상세 정보 조회
      const recordData = await careApi.getRecordDetail(id);
      setRecord(recordData);
      
      // 2. 공통 코드 로드 대기 및 파일 조회
      if (targetTypeCodes.length > 0) {
        const found = targetTypeCodes.find(c => c.code === 'CARE_RECORD');
        if (found) {
          const filesData = await fileApi.getFiles(found.id, id);
          setFiles(filesData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch care record detail:', err);
      setError('기록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id, targetTypeCodes]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    record,
    files,
    isLoading,
    error,
    refetch: fetchDetail
  };
};
