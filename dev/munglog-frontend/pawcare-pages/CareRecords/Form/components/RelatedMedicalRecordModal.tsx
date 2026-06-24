import React, { useState, useEffect } from 'react';
import type { CareRecord } from '@/types/care';

import { dogApi } from '@/api/dogApi';
import type { Dog } from '@/types/dog';

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
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    if (isOpen) {
      onSearch(inputValue);
      dogApi.getDogs().then(setDogs).catch(() => setDogs([]));
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
        className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-stone-100 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-black text-stone-800 tracking-tight">연관 진료 기록 찾기</h3>
            <button onClick={onClose} className="text-stone-300 hover:text-stone-500 text-2xl">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 강아지 선택 추가 */}
            <div className="relative group">
              <select
                value={selectedDogId?.toString() || ''}
                onChange={(e) => onDogChange(e.target.value)}
                className="w-full h-[52px] px-5 rounded-2xl bg-stone-50 border border-transparent focus:border-[#FF6B00] focus:bg-white text-[14px] font-bold appearance-none outline-none cursor-pointer transition-all"
              >
                <option value="">강아지 선택 🐾</option>
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id.toString()}>{dog.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 font-bold group-hover:text-[#FF6B00] transition-colors">▼</span>
            </div>

            <div className="relative group">
              <input 
                type="text"
                placeholder="병원/진단명 검색..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-stone-50 h-[52px] pl-10 pr-4 rounded-2xl border border-transparent focus:border-[#FF6B00] focus:bg-white outline-none text-[14px] font-bold transition-all"
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
                className="p-5 rounded-2xl hover:bg-orange-50 border border-transparent hover:border-orange-100 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-stone-300 uppercase tracking-widest group-hover:text-[#FF6B00]/60">
                    {record.recordDate}
                  </span>
                  {record.clinicName && (
                    <span className="text-[10px] font-black text-white bg-stone-300 px-2 py-0.5 rounded-md group-hover:bg-[#FF6B00]/40">
                      {record.clinicName}
                    </span>
                  )}
                </div>
                <h4 className="text-[15px] font-bold text-stone-700 mt-1 group-hover:text-[#FF6B00]">
                  {record.title || record.diagnosis || '제목 없는 진료 기록'}
                </h4>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <span className="text-4xl block mb-4 opacity-20">{isLoading ? '⏳' : '🔎'}</span>
              <p className="text-stone-400 font-bold text-[14px]">
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
