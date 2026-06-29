import React, { useState, useEffect } from 'react';
import type { CareRecord } from '@/types/care';
import { usePet } from '@/app/common/hooks/usePet';
import { Select } from '@/components/common/Select';

interface RelatedMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CareRecord[];
  isLoading: boolean;
  selectedDogId: string | number | undefined; // 추가
  onDogChange: (dogId: string) => void; // 추가
  onSearch: (keyword: string) => void;
  onSelect: (record: CareRecord) => void;
}

export const RelatedMedicalRecordModal: React.FC<RelatedMedicalRecordModalProps> = ({
  isOpen,
  onClose,
  candidates,
  isLoading,
  selectedDogId,
  onDogChange,
  onSearch,
  onSelect
}) => {
  const [inputValue, setInputValue] = useState('');
  const { pets: dogs } = usePet();

  useEffect(() => {
    if (isOpen) {
      onSearch(inputValue);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [inputValue, isOpen, onSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-background w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-black text-foreground tracking-tight">연관 진료 기록 찾기</h3>
            <button onClick={onClose} className="text-text-sub hover:text-foreground text-2xl">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 강아지 선택 추가 */}
            <Select
              value={selectedDogId?.toString() || ''}
              onChange={(e) => onDogChange(e.target.value)}
              className="h-[52px]"
              options={[
                { label: '강아지 선택 🐾', value: '' },
                ...dogs.map((dog) => ({
                  label: dog.name,
                  value: dog.id.toString(),
                })),
              ]}
            />


            <div className="relative group">
              <input
                type="text"
                placeholder="병원/진단명 검색..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-surface-green h-[52px] pl-10 pr-4 rounded-2xl border border-border focus:border-main-green focus:bg-background text-[14px] font-bold text-foreground outline-none transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-20 group-focus-within:opacity-100">🔍</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-[300px]">
          {candidates.length > 0 ? (
            candidates.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  onSelect(record);
                  onClose();
                }}
                className="p-5 rounded-2xl hover:bg-main-green/5 border border-transparent hover:border-main-green/20 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-text-sub uppercase tracking-widest group-hover:text-main-green/80">
                    {record.recordDate}
                  </span>
                  {record.clinicName && (
                    <span className="text-[10px] font-black text-foreground bg-surface-green border border-border px-2 py-0.5 rounded-md group-hover:bg-main-green/20">
                      {record.clinicName}
                    </span>
                  )}
                </div>
                <h4 className="text-[15px] font-bold text-foreground mt-1 group-hover:text-main-green">
                  {record.title || record.diagnosis || '제목 없는 진료 기록'}
                </h4>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <span className="text-4xl block mb-4 opacity-20">{isLoading ? '⏳' : '🔎'}</span>
              <p className="text-text-sub font-bold text-[14px]">
                {isLoading ? '검색 중입니다...' : '검색 결과가 없습니다.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
          <p className="text-[12px] text-stone-400 font-medium">실시간으로 서버에서 기록을 찾아드립니다.</p>
        </div>
      </div>
    </div>
  );
};
