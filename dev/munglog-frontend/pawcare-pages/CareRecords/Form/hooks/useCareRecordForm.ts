import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { careApi } from '@/api/careApi';
import { fileApi } from '@/api/fileApi';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { useToast } from '@/context/ToastContext';
import type { CareRecord, CareRecordCreateRequest } from '@/types/care';

export const useCareRecordForm = (id?: string, options?: { prefillDate?: string; onSaveSuccess?: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  const { codes: targetTypeCodes } = useCommonCodes('FILE_TARGET_TYPE');

  const [recordTypeId, setRecordTypeId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [fromScheduleId, setFromScheduleId] = useState<string | null>(null);

  const [commonData, setCommonData] = useState({
    dogId: '',
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

  // 파일 조회 완료 여부 플래그
  const fileLoadedRef = useRef(false);

  const getRecordTypeCode = (typeId: number) => {
    return recordTypes.find(t => t.id === typeId)?.code || 'MEDICAL';
  };

  // 상세 데이터 본문 로드
  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      try {
        setIsFetching(true);
        const record = await careApi.getRecordDetail(id);
        console.log('[useCareRecordForm] Loaded record data:', record);
        if (!record) return;

        const raw = record as any;
        const recordTypeIdVal = Number(record.recordTypeId || raw.record_type_id || raw.record_type?.id || 0);
        setRecordTypeId(recordTypeIdVal);
        
        const currentDogId = record.dogId || raw.dog_id || (record.dog?.id) || '';
        
        setCommonData({
          dogId: currentDogId.toString(),
          recordDate: record.recordDate || new Date().toISOString().split('T')[0],
          title: record.title || '',
          note: record.note || ''
        });

        const getField = (camelField: string, snakeField: string) => 
            raw[camelField] || raw[snakeField] || 
            raw.medicalDetails?.[camelField] || raw.medical_details?.[snakeField] ||
            raw.expenseDetails?.[camelField] || raw.expense_details?.[snakeField];

        const recordAmount = record.amount?.toString() || '';

        setMedicalData({
          clinicName: getField('clinicName', 'clinic_name') || '',
          symptoms: getField('symptoms', 'symptoms') || '',
          symptomTags: record.symptomTags || getField('symptomTags', 'symptom_tags') || [],
          diagnosis: getField('diagnosis', 'diagnosis') || '',
          treatment: getField('treatment', 'treatment') || '',
          amount: recordAmount,
          hasMedication: !!getField('medicationStartDate', 'medication_start_date'),
          medicationStartDate: getField('medicationStartDate', 'medication_start_date') || new Date().toISOString().split('T')[0],
          medicationDays: getField('medicationDays', 'medication_days')?.toString() || '',
          isMedicationCompleted: !!getField('isMedicationCompleted', 'is_medication_completed')
        });

        setExpenseData({
          categoryCode: record.categoryTypeId || raw.category_type_id || record.categoryId || raw.category_id || 
                        raw.expenseDetails?.categoryId || raw.expense_details?.category_id || 
                        raw.expenseDetails?.categoryTypeId || raw.expense_details?.category_type_id || '',
          amount: recordAmount,
          memo: getField('memo', 'memo') || '',
          relatedMedicalRecordId: record.relatedMedicalRecordId || raw.related_medical_record_id || 
                                  raw.expenseDetails?.relatedMedicalRecordId || raw.expense_details?.related_medical_record_id || 
                                  record.relatedMedicalRecord?.id || raw.related_medical_record?.id || '',
          relatedMedicalRecord: record.relatedMedicalRecord || raw.related_medical_record || 
                                raw.expenseDetails?.relatedMedicalRecord || raw.expense_details?.related_medical_record || null
        });
      } catch (err) {
        console.error('Failed to load record:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchRecord();
  }, [id]);

  // 공통코드가 준비되면 파일 정보를 별도로 가져옴
  useEffect(() => {
    if (!id || targetTypeCodes.length === 0 || fileLoadedRef.current) return;

    const fetchFiles = async () => {
      const found = targetTypeCodes.find(c => c.code === 'CARE_RECORD');
      if (found && found.id) {
        try {
          const files = await fileApi.getFiles(found.id, id);
          if (files && files.length > 0) fileUploader.setInitialFiles(files);
          fileLoadedRef.current = true; // 중복 호출 방지
        } catch (err) {
          console.error('Failed to load files:', err);
        }
      }
    };
    fetchFiles();
  }, [id, targetTypeCodes, fileUploader]);

  // recordTypeId 초기값 설정 (코드가 로드되면 기본값 MEDICAL(id:1) 등 설정)
  useEffect(() => {
    if (!id && recordTypeId === 0 && recordTypes.length > 0) {
      const medicalType = recordTypes.find(t => t.code === 'MEDICAL');
      if (medicalType) setRecordTypeId(medicalType.id);
      else setRecordTypeId(recordTypes[0].id);
    }
  }, [id, recordTypeId, recordTypes]);

  // 전환 데이터 처리 (신규 등록 시)
  useEffect(() => {
    if (id) return;
    const prefillData = location.state?.prefillData;
    if (prefillData) {
      const targetType = prefillData.recordTypeId || (prefillData as any).recordType;
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

      if (prefillData.fromScheduleId) {
        setFromScheduleId(String(prefillData.fromScheduleId));
      }
    } else if (options?.prefillDate) {
      setCommonData(prev => ({
        ...prev,
        recordDate: options.prefillDate!
      }));
    }
  }, [id, location.state, recordTypes, options?.prefillDate]);

  useEffect(() => {
    const typeCode = getRecordTypeCode(recordTypeId);
    if (typeCode === 'MEDICAL') {
      setExpenseData(prev => ({ ...prev, amount: medicalData.amount }));
    } else {
      setMedicalData(prev => ({ ...prev, amount: expenseData.amount }));
    }
  }, [medicalData.amount, expenseData.amount, recordTypeId, recordTypes]);

  const handleSave = async () => {
    if (!commonData.dogId) return showToast('반려견을 선택해주세요.', 'warning');
    if (!commonData.title.trim()) return showToast('제목을 입력해주세요.', 'warning');

    const typeCode = getRecordTypeCode(recordTypeId);
    if (typeCode === 'EXPENSE' && !expenseData.categoryCode) {
      return showToast('지출 카테고리를 선택해주세요.', 'warning');
    }

    try {
      setIsLoading(true);

      let uploadedFileIds: Array<string | number> = [];
      if (fileUploader.localFiles.length > 0) {
        const uploadedFiles = await fileUploader.upload(id ?? null);
        if (uploadedFiles) uploadedFileIds = uploadedFiles.map(f => f.id);
      }

      const combinedFileIds = [...fileUploader.existingFileIds, ...uploadedFileIds];

      const payload: CareRecordCreateRequest = {
        dogId: commonData.dogId,
        recordTypeId: recordTypeId, 
        recordDate: commonData.recordDate,
        title: commonData.title.trim(),
        note: commonData.note.trim() || undefined,
        fileIds: combinedFileIds.length > 0 ? combinedFileIds : undefined,
        sourceScheduleId: fromScheduleId,
        medicalDetails: typeCode === 'MEDICAL' ? {
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
        expenseDetails: typeCode === 'EXPENSE' ? {
          categoryId: Number(expenseData.categoryCode), 
          amount: Number(expenseData.amount || 0),
          memo: expenseData.memo.trim() || undefined,
          relatedMedicalRecordId: expenseData.relatedMedicalRecordId ? String(expenseData.relatedMedicalRecordId) : null
        } : null
      };

      if (id) {
        await careApi.updateRecord(id, payload);
        showToast('기록이 수정되었습니다! ✨', 'success');
        if (options?.onSaveSuccess) {
          options.onSaveSuccess();
        } else {
          navigate(`/care-records/${id}`); 
        }
      } else {
        await careApi.createRecord(payload);
        showToast('기록이 저장되었습니다! ✨', 'success');
        if (options?.onSaveSuccess) {
          options.onSaveSuccess();
        } else {
          navigate('/care-records'); 
        }
      }
    } catch (err: any) {
      console.error('Save Error:', err);
      showToast(err.response?.data?.message || '저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recordTypeId, setRecordTypeId,
    commonData, setCommonData,
    medicalData, setMedicalData,
    expenseData, setExpenseData,
    fileUploader,
    handleSave,
    isLoading,
    isFetching
  };
};
