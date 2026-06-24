import React, { useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO
} from 'date-fns';
import type { Schedule } from '@/types/schedule';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface MiniCalendarProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateClick: (date: Date) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, schedules, onDateClick }) => {
  const { codes: scheduleTypes, getCodeById } = useCommonCodes('SCHEDULE_TYPE');

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getDaySchedules = (day: Date) => {
    return schedules.filter(s => isSameDay(parseISO(s.scheduleDate), day));
  };

  // 색상 매핑 함수
  const getMarkerColor = (typeCode: string) => {
    switch(typeCode) {
      case 'MEDICAL': return 'bg-[#FF6B00]';
      case 'GROOMING': return 'bg-blue-400';
      case 'MEDICATION':
      case 'HEARTWORM': return 'bg-green-400';
      case 'CHECKUP': return 'bg-purple-400';
      default: return 'bg-stone-300';
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100 flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[16px] font-black text-[#2D2D2D] uppercase tracking-tight">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>

      {/* 2. Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-stone-300 mb-2">{d}</div>
        ))}
        {days.map((day, i) => {
          const daySchedules = getDaySchedules(day);
          const isSelected = isSameDay(day, currentDate);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div 
              key={i} 
              onClick={() => onDateClick(day)}
              className={`relative aspect-square flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl
                ${isSelected ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20 scale-110 z-10' : 'hover:bg-stone-50'}
                ${!isCurrentMonth && !isSelected ? 'opacity-20' : ''}
              `}
            >
              <span className={`text-[12px] font-black tabular-nums ${isSelected ? 'text-white' : 'text-[#2D2D2D]'}`}>
                {format(day, 'd')}
              </span>
              
              <div className="flex gap-0.5 mt-1 h-1">
                {daySchedules.slice(0, 3).map((s, idx) => {
                  const typeCode = s.scheduleTypeId ? getCodeById(s.scheduleTypeId) : String(s.scheduleTypeCode || '');
                  return (
                    <div 
                      key={idx} 
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : getMarkerColor(typeCode)}`} 
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Legend (범례) 추가 */}
      <div className="pt-4 border-t border-stone-50">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {scheduleTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getMarkerColor(type.code)}`} />
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">
                {type.codeName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
