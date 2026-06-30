import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { careApi } from '@/api/careApi';
import { fileApi } from '@/api/fileApi';
import { symptomSnapApi } from '@/api/symptomSnapApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { useToast } from '@/app/common/hooks/useToast';
import { usePet } from '@/app/common/hooks/usePet';
import type { CareRecordCreateRequest } from '@/types/care';

export const useCareRecordForm = (id?: string, options?: { prefillDate?: string; onSaveSuccess?: () => void }) => {
  const router = useRouter();
  const { success, error: toastError, warning } = useToast();
  const { selectedPetId } = usePet();

  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');

  const [recordTypeId, setRecordTypeId] = useState<number>(0);
  const [vaccinationTypeId, setVaccinationTypeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [fromScheduleId, setFromScheduleId] = useState<string | null>(null);
  const [pendingSnapId, setPendingSnapId] = useState<string>('');

  const [commonData, setCommonData] = useState({
    dogId: selectedPetId && selectedPetId !== 'ALL' ? selectedPetId.toString() : '',
    recordDate: options?.prefillDate || new Date().toISOString().split('T')[0],
    title: '',
    note: ''
  });

  const [medicalData, setMedicalData] = useState({
    clinicName: '',
    symptoms: '',
    symptomTags: [] as string[],
    diagnosis: '',
    treatment: '',
    amount: '',
    hasMedication: false,
    medicationStartDate: new Date().toISOString().split('T')[0],
    medicationDays: '',
    isMedicationCompleted: false
  });

  const [expenseData, setExpenseData] = useState({
    categoryCode: '' as string | number,
    amount: '',
    memo: '',
    relatedMedicalRecordId: '' as string | number,
    relatedMedicalRecord: null as any
  });

  const fileUploader = useFileUpload('CARE_RECORD');

  const fileLoadedRef = useRef(false);

  const getRecordTypeCode = (typeId: number) => {
    return recordTypes.find(t => t.id === typeId)?.code || 'ETC';
  };

  // 상세 데이터 본문 로드
  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      try {
        setIsFetching(true);
        const record = await careApi.getRecordDetail(id);
        if (!record) return;

        setRecordTypeId(record.recordTypeId || 0);
        setVaccinationTypeId(record.vaccinationTypeId ?? null);
        setCommonData({
          dogId: (record.dogId || '').toString(),
          recordDate: record.recordDate || new Date().toISOString().split('T')[0],
          title: record.title || '',
          note: record.note || ''
        });

        setMedicalData({
          clinicName: record.clinicName || '',
          symptoms: record.symptoms || '',
          symptomTags: record.symptomTags || [],
          diagnosis: record.diagnosis || '',
          treatment: record.treatment || '',
          amount: record.amount?.toString() || '',
          hasMedication: !!record.medicationStartDate,
          medicationStartDate: record.medicationStartDate || new Date().toISOString().split('T')[0],
          medicationDays: record.medicationDays?.toString() || '',
          isMedicationCompleted: record.medicationStatus === 'COMPLETED'
        });

        setExpenseData({
          categoryCode: record.categoryTypeId || '',
          amount: record.amount?.toString() || '',
          memo: record.note || '',
          relatedMedicalRecordId: record.relatedMedicalRecordId || '',
          relatedMedicalRecord: record.relatedMedicalRecord || null
        });

        if (!fileLoadedRef.current) {
          fileLoadedRef.current = true;
          const files = await fileApi.getFiles('CARE_RECORD', id);
          if (files.length > 0) fileUploader.setInitialFiles(files);
        }
      } catch (err) {
        console.error('Failed to load record:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // recordTypeId 초기값 설정 (신규 등록 시 첫 번째 타입으로 기본 선택)
  useEffect(() => {
    if (!id && recordTypeId === 0 && recordTypes.length > 0) {
      setRecordTypeId(recordTypes[0].id);
    }
  }, [id, recordTypeId, recordTypes]);

  // 일정 -> 케어기록 전환 시 넘어온 프리필 데이터 처리 (sessionStorage 경유)
  useEffect(() => {
    if (id) return;
    const stored = sessionStorage.getItem('careRecordPrefill');
    if (!stored) return;
    sessionStorage.removeItem('careRecordPrefill');

    try {
      const prefillData = JSON.parse(stored);
      const targetType = prefillData.recordTypeId || prefillData.recordType;
      if (typeof targetType === 'number') {
        setRecordTypeId(targetType);
      } else if (typeof targetType === 'string') {
        const found = recordTypes.find(t => t.code === targetType);
        if (found) setRecordTypeId(found.id);
      }

      setCommonData({
        dogId: prefillData.dogId?.toString() || '',
        recordDate: prefillData.recordDate || options?.prefillDate || new Date().toISOString().split('T')[0],
        title: prefillData.title || '',
        note: prefillData.note || ''
      });

      if (prefillData.medicalDetails) {
        setMedicalData(prev => ({
          ...prev,
          clinicName: prefillData.medicalDetails.clinicName || '',
          symptomTags: prefillData.medicalDetails.symptomTags || []
        }));
      }

      if (prefillData.expenseDetails) {
        setExpenseData(prev => ({
          ...prev,
          categoryCode: prefillData.expenseDetails.categoryTypeId || prefillData.expenseDetails.categoryId || prefillData.expenseDetails.categoryCode || '',
          memo: prefillData.expenseDetails.memo || '',
          relatedMedicalRecordId: prefillData.expenseDetails.relatedMedicalRecordId || ''
        }));
      }

      if (prefillData.files && prefillData.files.length > 0) {
        fileUploader.setInitialFiles(prefillData.files);
      }

      if (prefillData.vaccinationTypeId) {
        setVaccinationTypeId(Number(prefillData.vaccinationTypeId));
      }

      if (prefillData.fromScheduleId) {
        setFromScheduleId(String(prefillData.fromScheduleId));
      }
    } catch (err) {
      console.error('Failed to parse care record prefill data:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, recordTypes]);

  // 신규 등록 시 날짜 프리필 처리 (캘린더에서 날짜 지정 후 등록)
  useEffect(() => {
    if (id || !options?.prefillDate) return;
    setCommonData(prev => ({
      ...prev,
      recordDate: options.prefillDate!
    }));
  }, [id, options?.prefillDate]);

  useEffect(() => {
    const typeCode = getRecordTypeCode(recordTypeId);
    if (isMedicalRecordType(typeCode)) {
      setExpenseData(prev => ({ ...prev, amount: medicalData.amount }));
    } else {
      setMedicalData(prev => ({ ...prev, amount: expenseData.amount }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicalData.amount, expenseData.amount, recordTypeId, recordTypes]);

  const handleSave = async () => {
    if (!commonData.dogId) return warning('반려견을 선택해주세요.');
    if (!commonData.title.trim()) return warning('제목을 입력해주세요.');

    const typeCode = getRecordTypeCode(recordTypeId);
    const isMedical = isMedicalRecordType(typeCode);
    if (!isMedical && !expenseData.categoryCode) {
      return warning('지출 카테고리를 선택해주세요.');
    }

    try {
      setIsLoading(true);

      const payload: CareRecordCreateRequest = {
        dogId: commonData.dogId,
        recordTypeId,
        recordDate: commonData.recordDate,
        title: commonData.title.trim(),
        note: commonData.note.trim() || undefined,
        sourceScheduleId: fromScheduleId,
        vaccinationTypeId: vaccinationTypeId ?? null,
        medicalDetails: isMedical ? {
          clinicName: medicalData.clinicName.trim() || undefined,
          symptoms: medicalData.symptoms.trim() || undefined,
          symptomTags: medicalData.symptomTags,
          diagnosis: medicalData.diagnosis.trim() || undefined,
          treatment: medicalData.treatment.trim() || undefined,
          amount: medicalData.amount ? Number(medicalData.amount) : null,
          medicationStartDate: medicalData.hasMedication ? medicalData.medicationStartDate : null,
          medicationDays: medicalData.hasMedication && medicalData.medicationDays ? Number(medicalData.medicationDays) : null,
          isMedicationCompleted: medicalData.isMedicationCompleted
        } : null,
        expenseDetails: !isMedical ? {
          categoryId: Number(expenseData.categoryCode),
          amount: Number(expenseData.amount || 0),
          memo: expenseData.memo.trim() || undefined,
          relatedMedicalRecordId: expenseData.relatedMedicalRecordId ? String(expenseData.relatedMedicalRecordId) : null
        } : null
      };

      const savedRecord = id
        ? await careApi.updateRecord(id, payload)
        : await careApi.createRecord(payload);

      // 증상 스냅 연동 (신규 등록 시 저장 후 처리)
      if (!id && pendingSnapId) {
        try {
          await symptomSnapApi.linkRecord(pendingSnapId, String(savedRecord.id));
        } catch (e) {
          console.error('Failed to link snap after save:', e);
        }
      }

      if (fileUploader.localFiles.length > 0) {
        await fileUploader.syncToServer(savedRecord.id);
      }

      if (id) {
        success('기록이 수정되었습니다! ✨');
        if (options?.onSaveSuccess) {
          options.onSaveSuccess();
        } else {
          router.push(`/care-records/${id}`);
        }
      } else {
        success('기록이 저장되었습니다! ✨');
        if (options?.onSaveSuccess) {
          options.onSaveSuccess();
        } else {
          router.push('/care-records');
        }
      }
    } catch (err: any) {
      console.error('Save Error:', err);
      toastError(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recordTypeId, setRecordTypeId,
    vaccinationTypeId, setVaccinationTypeId,
    commonData, setCommonData,
    medicalData, setMedicalData,
    expenseData, setExpenseData,
    fileUploader,
    handleSave,
    isLoading,
    isFetching,
    pendingSnapId, setPendingSnapId
  };
};
