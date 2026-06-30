import { useState, useEffect, useCallback } from 'react';
import { careApi } from '@/api/careApi';
import { RECORD_TYPE_CODES } from '@/lib/codeGroups';
import { buildVaccinationSummary } from '@/utils/vaccinationDDay';
import type { CareRecord, CareRecordCreateRequest } from '@/types/care';
import type { VaccinationSummaryItem } from '@/types/vaccination';

const VACCINATION_TYPE_ID = RECORD_TYPE_CODES.find(c => c.code === 'VACCINATION')?.id ?? 4;

export interface VaccinationFormData {
  title: string;
  recordDate: string;
  clinicName: string;
  note: string;
  vaccinationTypeId?: number | null;
}

export const useVaccinationRecords = (petId: string) => {
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!petId) return;
    setIsLoading(true);
    try {
      const list = await careApi.getRecords({ petId, type: 'VACCINATION' });
      const sorted = [...list].sort((a, b) => b.recordDate.localeCompare(a.recordDate));

      // clinicName은 상세 API에서만 제공
      const detailed = await Promise.all(
        sorted.map(r => careApi.getRecordDetail(r.id).catch(() => r))
      );

      setRecords(detailed);
    } catch (err) {
      console.error('예방접종 기록 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const summary: VaccinationSummaryItem[] = buildVaccinationSummary(records);

  const createVaccination = async (data: VaccinationFormData): Promise<CareRecord> => {
    const payload: CareRecordCreateRequest = {
      petId,
      recordTypeId: VACCINATION_TYPE_ID,
      recordDate: data.recordDate,
      title: data.title.trim(),
      note: data.note.trim() || undefined,
      vaccinationTypeId: data.vaccinationTypeId ?? null,
      medicalDetails: data.clinicName.trim()
        ? { clinicName: data.clinicName.trim() }
        : null,
    };
    const saved = await careApi.createRecord(payload);
    await fetchRecords();
    return saved;
  };

  return { records, summary, isLoading, refetch: fetchRecords, createVaccination };
};
