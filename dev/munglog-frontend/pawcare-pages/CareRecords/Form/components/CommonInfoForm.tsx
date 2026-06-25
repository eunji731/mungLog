import React, { useState, useRef, useEffect } from 'react';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import TimelineDatePicker from '@/app/calendar/components/TimelineDatePicker';
import { Textarea } from '@/components/common/Textarea';
import { usePet } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/app/common/lib/clientApi';

interface CommonInfoFormProps {
  data: {
    dogId: string | number;
    recordDate: string;
    title: string;
    note: string;
  };
  onChange: (data: any) => void;
  isEmbedded?: boolean;
}

export const CommonInfoForm: React.FC<CommonInfoFormProps> = ({ data, onChange, isEmbedded = false }) => {
  const { pets: dogs } = usePet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDog = dogs.find(d => String(d.id) === String(data.dogId));

  return (
    <Section 
      title="기본 정보" 
      description="어떤 아이의 어떤 날 기록인가요?"
      variant={isEmbedded ? 'flat' : 'default'}
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isEmbedded ? 'gap-3 mb-3' : 'gap-6 mb-6'}`}>
        
        {/* Custom Cute Dog Dropdown */}
        <div className="w-full space-y-2 text-left relative animate-in fade-in duration-300" ref={dropdownRef}>
          <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">
            반려견 *
          </label>
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center justify-between shadow-sm bg-background ${
              isOpen 
                ? 'border-main-green ring-4 ring-main-green/5' 
                : 'border-border hover:border-main-green/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {selectedDog ? (
                <>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-green border border-border flex items-center justify-center shrink-0 shadow-sm">
                    {selectedDog.photo ? (
                      <img src={getImagePath(selectedDog.photo, 'profiles')} alt={selectedDog.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[13px]">🐶</span>
                    )}
                  </div>
                  <span className="text-[15px] font-black text-foreground">
                    {selectedDog.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-surface-green border border-border flex items-center justify-center shrink-0 text-text-sub shadow-sm">
                    <span className="text-[13px]">🐾</span>
                  </div>
                  <span className="text-[15px] font-bold text-text-sub/50">
                    반려견 선택
                  </span>
                </>
              )}
            </div>
            <span className="text-[9px] text-text-sub tracking-widest pl-2">
              {isOpen ? '▲' : '▼'}
            </span>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-[150] bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden p-2 animate-in zoom-in-95 duration-200 origin-top">
              <div className="max-h-[190px] overflow-y-auto no-scrollbar space-y-1">
                {dogs.map((dog) => {
                  const isCurrent = String(dog.id) === String(data.dogId);
                  return (
                    <button
                      key={dog.id}
                      type="button"
                      onClick={() => {
                        onChange({ ...data, dogId: dog.id });
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                        isCurrent 
                          ? 'bg-main-green text-white font-black' 
                          : 'hover:bg-surface-green/45 text-text-main hover:text-main-green hover:translate-x-1'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${
                        isCurrent ? 'border-white/30 bg-white/20' : 'border-border bg-surface-green'
                      }`}>
                        {dog.photo ? (
                          <img src={getImagePath(dog.photo, 'profiles')} alt={dog.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[14px]">🐶</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold leading-tight">{dog.name}</span>
                        <span className={`text-[10px] leading-tight ${isCurrent ? 'text-white/70' : 'text-text-sub/70'}`}>
                          {dog.breed || '믹스견'}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {dogs.length === 0 && (
                  <div className="text-center py-4 text-xs font-bold text-text-sub">
                    등록된 반려견이 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <TimelineDatePicker 
          label="기록일 *" 
          variant="form"
          value={data.recordDate} 
          onChange={(date) => onChange({ ...data, recordDate: date })} 
        />
      </div>
      <div className={isEmbedded ? 'space-y-3' : 'space-y-6'}>
        <Input 
          label="제목 *" 
          placeholder="오늘의 주요 활동이나 병원 방문 목적" 
          value={data.title} 
          onChange={(e) => onChange({ ...data, title: e.target.value })} 
        />
        <Textarea 
          label="공통 메모" 
          placeholder="추가적으로 남기고 싶은 내용을 자유롭게 적어주세요." 
          value={data.note} 
          onChange={(e) => onChange({ ...data, note: e.target.value })} 
        />
      </div>
    </Section>
  );
};
