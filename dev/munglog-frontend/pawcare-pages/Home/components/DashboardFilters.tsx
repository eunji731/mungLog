import { useEffect, useState } from 'react';
import { dogApi } from '@/api/dogApi';
import type { Dog } from '@/types/dog';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DatePicker } from '@/components/common/DatePicker';

interface DashboardFiltersProps {
  onFilterChange: (filters: { dogId?: string; startDate: string; endDate: string }) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onFilterChange }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  
  const now = new Date();
  const [selectedDogId, setSelectedDogId] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | null>(startOfMonth(now));
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth(now));

  useEffect(() => {
    dogApi.getDogs().then(setDogs).catch(() => setDogs([]));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      onFilterChange({ 
        dogId: selectedDogId, 
        startDate: format(startDate, 'yyyy-MM-dd'), 
        endDate: format(endDate, 'yyyy-MM-dd') 
      });
    }
  }, [selectedDogId, startDate, endDate]);

  const handlePreset = (type: '7D' | '1M' | '3M') => {
    const today = new Date();
    let start = new Date();
    
    if (type === '7D') start = subDays(today, 7);
    else if (type === '1M') start = subDays(today, 30);
    else if (type === '3M') start = subDays(today, 90);

    setStartDate(start);
    setEndDate(today);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      
      {/* 반려견 선택 */}
      <div className="relative group w-full sm:w-auto">
        <select 
          value={selectedDogId || ''}
          onChange={(e) => setSelectedDogId(e.target.value || undefined)}
          className="appearance-none bg-white h-[52px] w-full sm:w-[160px] pl-6 pr-12 rounded-[20px] border border-stone-100 shadow-sm text-[#2D2D2D] font-black text-[14px] outline-none focus:ring-4 focus:ring-[#FF6B00]/5 focus:border-[#FF6B00] transition-all cursor-pointer"
        >
          <option value="">모든 아이들 🐾</option>
          {dogs.map(dog => (
            <option key={dog.id} value={dog.id}>{dog.name}</option>
          ))}
        </select>
        <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 group-hover:text-[#FF6B00] transition-colors">▼</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
        {/* 퀵 버튼 (모바일에서도 가로로 작게 유지) */}
        <div className="flex gap-1 p-1 bg-stone-100/50 rounded-[18px]">
          {(['7D', '1M', '3M'] as const).map(p => (
            <button
              key={p}
              onClick={() => handlePreset(p)}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black text-stone-400 hover:bg-white hover:text-[#FF6B00] hover:shadow-sm transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* 기간 카드 - 모바일에서 유연한 너비 적용 */}
        <div className="flex items-center px-4 h-[52px] bg-white rounded-[20px] border border-stone-100 shadow-sm focus-within:border-[#FF6B00] transition-all flex-grow sm:flex-grow-0">
          <div className="flex items-center gap-2 w-full justify-center">
            <span className="text-base opacity-30">📅</span>
            <div className="flex items-center">
              <div className="w-[85px] sm:w-[95px]">
                <DatePicker 
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              <span className="text-stone-300 font-light mx-0.5 sm:mx-1">~</span>
              <div className="w-[85px] sm:w-[95px]">
                <DatePicker 
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
