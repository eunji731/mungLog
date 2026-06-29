import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { careApi } from '@/api/careApi';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import type { CareRecord } from '@/types/care';
import { RelatedMedicalRecordModal } from './RelatedMedicalRecordModal';

interface ExpenseFormProps {
  data: {
    categoryCode: string | number;
    amount: string | number;
    memo: string;
    relatedMedicalRecordId: string | number | null;
    relatedMedicalRecord?: any; // 추가된 필드
  };
  dogId?: string | number;
  onDogChange?: (dogId: string) => void;
  onChange: (data: any) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ data, dogId, onDogChange, onChange }) => {
  const [medicalCandidates, setMedicalCandidates] = useState<CareRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecordInfo, setSelectedRecordInfo] = useState<any>(null);

  const { codes: categories } = useCommonCodes('EXPENSE_CATEGORY');
  const debounceTimerRef = useRef<number | null>(null);

  const categoryOptions = categories.map(c => ({
    value: c.id.toString(),
    label: c.codeName
  }));

  const fetchCandidates = useCallback(async (id: string | number, keyword: string) => {
    try {
      setIsLoading(true);
      const results = await careApi.getMedicalRecordCandidates(id, keyword);
      setMedicalCandidates(results);
    } catch (err) {
      console.error('Failed to search medical records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    if (!dogId) return;
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      fetchCandidates(dogId, keyword);
    }, 300);
  }, [dogId, fetchCandidates]);

  useEffect(() => {
    if (dogId) fetchCandidates(dogId, '');
  }, [dogId, fetchCandidates]);

  // 연관 기록 표시 로직 보완
  useEffect(() => {
    if (data.relatedMedicalRecordId) {
      // 1. 서버에서 받은 원본 객체 정보가 있다면 우선 사용
      if (data.relatedMedicalRecord) {
        setSelectedRecordInfo(data.relatedMedicalRecord);
      }
      // 2. 후보군 리스트에서 찾기 (새로 선택했을 때 대응)
      else if (medicalCandidates.length > 0) {
        const found = medicalCandidates.find(m => m.id.toString() === data.relatedMedicalRecordId?.toString());
        if (found) setSelectedRecordInfo(found);
      }
    } else {
      setSelectedRecordInfo(null);
    }
  }, [data.relatedMedicalRecordId, data.relatedMedicalRecord, medicalCandidates]);

  const handleSelectRecord = (record: CareRecord) => {
    // 새로 선택 시 객체 정보와 ID를 동시에 업데이트
    onChange({
      ...data,
      relatedMedicalRecordId: record.id,
      relatedMedicalRecord: record
    });
    setSelectedRecordInfo(record);
  };

  const handleDogChangeInModal = (newDogId: string) => {
    if (onDogChange) onDogChange(newDogId);
    onChange({
      ...data,
      relatedMedicalRecordId: null,
      relatedMedicalRecord: null
    });
  };

  return (
    <div className="space-y-6">
      <Section title="지출 정보" description="얼마를 어디에 사용하셨나요?" overflowVisible={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Select
            label="카테고리 *"
            options={categoryOptions}
            value={data.categoryCode?.toString()}
            onChange={(e) => onChange({ ...data, categoryCode: Number(e.target.value) })}
          />
          <div className="relative">
            <Input
              label="금액 *"
              type="number"
              placeholder="0"
              value={data.amount}
              onChange={(e) => onChange({ ...data, amount: e.target.value })}
            />
            <span className="absolute right-5 bottom-4 text-[13px] font-black text-stone-300 uppercase">원</span>
          </div>
        </div>
        <Textarea
          label="지출 메모"
          placeholder="지출과 관련된 세부 내용을 기록하세요."
          value={data.memo}
          onChange={(e) => onChange({ ...data, memo: e.target.value })}
        />
      </Section>

      <Section title="연관 정보" description="병원 진료와 관련된 지출인가요?">
        <div className="space-y-4">
          {selectedRecordInfo ? (
            <div className="p-4 bg-main-green/5 border-2 border-main-green/20 rounded-[16px] flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-main-green text-[10px] font-black uppercase tracking-widest">연결된 진료 기록</span>
                <h4 className="text-[14px] font-bold text-foreground">
                  [{selectedRecordInfo.recordDate}] {selectedRecordInfo.title || selectedRecordInfo.clinicName || '진료 기록'}
                </h4>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(true)} className="px-3.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-foreground hover:border-main-green hover:text-main-green transition-all">변경</button>
                <button type="button" onClick={() => onChange({ ...data, relatedMedicalRecordId: null, relatedMedicalRecord: null })} className="px-3.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-red-500 hover:border-red-500/30 transition-all">해제</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full p-6 border-2 border-dashed border-border rounded-[16px] text-text-sub hover:border-main-green hover:text-main-green hover:bg-main-green/5 transition-all flex flex-col items-center gap-1.5 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🔍</span>
              <span className="font-bold text-xs">연관된 병원 진료 기록 찾기</span>
              <span className="text-[11px] opacity-60 font-medium">지출과 관련된 진료 내역이 있다면 선택해 주세요.</span>
            </button>
          )}
        </div>
      </Section>

      <RelatedMedicalRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidates={medicalCandidates}
        isLoading={isLoading}
        selectedDogId={dogId}
        onDogChange={handleDogChangeInModal}
        onSearch={handleSearch}
        onSelect={handleSelectRecord}
      />
    </div>
  );
};
