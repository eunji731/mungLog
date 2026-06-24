import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { dogApi } from '@/api/dogApi';
import type { Dog } from '@/types/dog';
import type { CareRecordsFilter } from '@/types/care';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { DatePicker } from '@/components/common/DatePicker';
import { parseISO, isValid } from 'date-fns';

interface FilterBarProps {
  filters: CareRecordsFilter;
  onChange: (filters: Partial<CareRecordsFilter>) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [localKeyword, setLocalKeyword] = useState(filters.keyword ?? '');
  const navigate = useNavigate();
  
  const { codes: allRecordTypes } = useCommonCodes('RECORD_TYPE');
  const recordTypes = allRecordTypes.filter(t => t.code !== 'MEMO');

  useEffect(() => {
    dogApi.getDogs().then(setDogs).catch(() => setDogs([]));
  }, []);

  useEffect(() => {
    setLocalKeyword(filters.keyword ?? '');
  }, [filters.keyword]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange({ keyword: localKeyword || undefined });
    }
  };

  // 문자열 날짜를 Date 객체로 안전하게 변환
  const startDate = filters.startDate ? parseISO(filters.startDate) : null;
  const endDate = filters.endDate ? parseISO(filters.endDate) : null;

  return (
    <div className="bg-white rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-[#F0F0F0]">
      <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">

        <div className="flex-grow flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow group">
            <input
              placeholder="무엇을 찾으시나요?"
              value={localKeyword}
              onChange={(e) => setLocalKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#F9F9F9] h-[56px] pl-12 pr-6 rounded-2xl border border-transparent focus:border-[#FF6B00] focus:bg-white outline-none text-[15px] font-bold transition-all duration-300 shadow-inner"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-20 group-focus-within:opacity-100 transition-opacity">🔍</span>
          </div>

          <div className="relative sm:w-56 group">
            <select
              value={filters.dogId ?? ''}
              onChange={(e) => onChange({ dogId: e.target.value || undefined })}
              className="w-full h-[56px] px-6 rounded-2xl bg-[#F9F9F9] border border-transparent focus:border-[#FF6B00] focus:bg-white text-[14px] font-black appearance-none outline-none cursor-pointer transition-all duration-300 shadow-inner"
            >
              <option value="">모든 아이들 🐾</option>
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>{dog.name}</option>
              ))}
            </select>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 font-bold group-hover:text-[#FF6B00] transition-colors">▼</span>
          </div>
        </div>

        <div className="flex p-1.5 bg-[#F5F5F5] rounded-[18px] shadow-inner">
          <button
            onClick={() => onChange({ type: 'ALL', recordTypeId: undefined })}
            className={`px-8 h-[44px] rounded-[14px] text-[13px] font-black transition-all duration-300 active:scale-95 ${(filters.type === 'ALL' && !filters.recordTypeId)
              ? 'bg-white text-[#FF6B00] shadow-sm'
              : 'text-stone-400 hover:text-stone-600'
              }`}
          >
            Total
          </button>
          
          {recordTypes.map((type) => {
            const isActive = filters.recordTypeId === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onChange({ type: type.code as any, recordTypeId: type.id })}
                className={`px-8 h-[44px] rounded-[14px] text-[13px] font-black transition-all duration-300 active:scale-95 ${isActive
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                {type.codeName}
              </button>
            )
          })}
        </div>

        {/* [개편] 프리미엄 기간 카드 스타일 적용 */}
        <div className="flex items-center px-5 h-[56px] bg-[#F9F9F9] rounded-2xl border border-transparent focus-within:border-[#FF6B00] focus-within:bg-white transition-all shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-base opacity-30">📅</span>
            <div className="flex items-center">
              <div className="w-[95px]">
                <DatePicker 
                  selected={startDate}
                  onChange={(date) => onChange({ startDate: date ? date.toISOString().split('T')[0] : undefined })}
                />
              </div>
              <span className="text-stone-300 font-light mx-1">~</span>
              <div className="w-[95px]">
                <DatePicker 
                  selected={endDate}
                  onChange={(date) => onChange({ endDate: date ? date.toISOString().split('T')[0] : undefined })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Button
            variant="primary"
            className="w-full h-[56px] px-8 rounded-2xl shadow-lg shadow-orange-500/20"
            onClick={() => navigate('/care-records/new')}
          >
            + 기록하기
          </Button>
        </div>
      </div>
    </div>
  );
};
