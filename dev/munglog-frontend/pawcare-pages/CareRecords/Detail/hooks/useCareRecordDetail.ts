import { useState, useEffect, useCallback } from 'react';
import { careApi } from '@/api/careApi';
import { fileApi } from '@/api/fileApi';
import type { CareRecord } from '@/types/care';
import type { FileItem } from '@/types/file';

export const useCareRecordDetail = (id: string | undefined) => {
  const [record, setRecord] = useState<CareRecord | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const recordData = await careApi.getRecordDetail(id);
      console.log('[DEBUG] Loaded Care Record Detail:', recordData);
      
      // Fallback: If relatedMedicalRecordId is present but relatedMedicalRecord is null/undefined, fetch it.
      if (recordData.relatedMedicalRecordId && !recordData.relatedMedicalRecord) {
        console.log('[DEBUG] Fallback fetching related medical record for ID:', recordData.relatedMedicalRecordId);
        try {
          const relatedData = await careApi.getRecordDetail(recordData.relatedMedicalRecordId);
          console.log('[DEBUG] Fallback fetched related medical record data:', relatedData);
          recordData.relatedMedicalRecord = {
            id: relatedData.id,
            title: relatedData.title,
            recordDate: relatedData.recordDate,
            clinicName: relatedData.clinicName
          };
        } catch (relatedErr) {
          console.error('[DEBUG] Failed to fetch related medical record:', relatedErr);
        }
      }

      setRecord(recordData);

      const filesData = await fileApi.getFiles('CARE_RECORD', id);
      console.log('[DEBUG] Loaded Attachments:', filesData);
      setFiles(filesData);
    } catch (err) {
      console.error('Failed to fetch care record detail:', err);
      setError('기록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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
