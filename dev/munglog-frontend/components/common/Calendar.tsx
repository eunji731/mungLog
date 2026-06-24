import React, { useState, useMemo, useEffect } from 'react';
import { buildCalendarDays, getMonthLabel, moveMonth } from '@/utils/dateUtils';
import { useCommonCodes } from '@/hooks/useCommonCodes';

export interface CalendarMarker {
  type: string | number; 
  color?: string;
}

export interface CalendarMarkers {
  [date: string]: CalendarMarker[];
}

interface CalendarProps {
  markers?: CalendarMarkers;
  selectedDate?: string;
  onDateClick?: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
  className?: string;
  // 어떤 종류의 범례를 보여줄지 결정 ('CARE' | 'SCHEDULE')
  legendType?: 'CARE' | 'SCHEDULE'; 
}

export const Calendar: React.FC<CalendarProps> = ({ 
  markers = {}, 
  selectedDate, 
  onDateClick,
  onMonthChange,
  className = '',
  legendType = 'CARE'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const monthLabel = getMonthLabel(currentMonth);

  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  const { codes: scheduleTypes, getCodeById } = useCommonCodes('SCHEDULE_TYPE');

  useEffect(() => {
    onMonthChange?.(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }, [currentMonth, onMonthChange]);

  const getMarkerColor = (type: string | number, isSelected: boolean) => {
    if (isSelected) return 'bg-white';
    
    const code = typeof type === 'number' 
      ? (recordTypes.find(t => t.id === type)?.code || getCodeById(type))
      : type;

    switch (code) {
      case 'MEDICAL': return 'bg-[#FF6B00]'; 
      case 'EXPENSE': return 'bg-stone-300'; 
      case 'MEMO': return 'bg-yellow-400';    
      case 'VACCINE': return 'bg-blue-500';   
      case 'PREMEDICINE': return 'bg-emerald-500'; 
      case 'MEDICATION': return 'bg-teal-400'; 
      case 'GROOMING': return 'bg-rose-400';   
      case 'CHECKUP': return 'bg-purple-400';  
      default: return 'bg-stone-200';
    }
  };

  return (
    <div className={`select-none text-[#2D2D2D] ${className}`}>
      <header className="flex justify-between items-center mb-10 px-2">
        <h3 className="text-[36px] md:text-[44px] font-black tracking-tighter leading-none">
          {monthLabel}
        </h3>
        <div className="flex gap-2 bg-stone-100/50 p-1.5 rounded-[20px]">
          <button onClick={() => setCurrentMonth(prev => moveMonth(prev, -1))} className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-white border border-stone-100 text-stone-400 hover:text-[#FF6B00] shadow-sm transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setCurrentMonth(prev => moveMonth(prev, 1))} className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-white border border-stone-100 text-stone-400 hover:text-[#FF6B00] shadow-sm transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 text-center">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
          <div key={d} className={`text-[10px] font-black tracking-[0.2em] pb-8 ${i === 0 ? 'text-red-400/50' : 'text-stone-300'}`}>
            {d}
          </div>
        ))}

        {calendarDays.map((day) => {
          const { dateString, dayNumber, isCurrentMonth, isToday } = day;
          const dayMarkers = markers[dateString] || [];
          const isSelected = selectedDate === dateString;

          return (
            <div 
              key={dateString} 
              onClick={() => onDateClick?.(dateString)}
              className={`relative h-[72px] md:h-[84px] flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer group
                ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                ${isSelected ? 'bg-[#FF6B00] shadow-xl shadow-orange-500/30 scale-105 z-10' : 'hover:bg-[#FDFBF7]'}
              `}
            >
              <span className={`text-[18px] md:text-[20px] font-black tabular-nums ${isSelected ? 'text-white' : isToday ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-[#2D2D2D]'}`}>
                {dayNumber}
              </span>
              <div className="flex gap-1 mt-2 h-1.5 items-center">
                {dayMarkers.slice(0, 3).map((marker, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getMarkerColor(marker.type, isSelected)}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 영역: legendType에 따라 분기 렌더링 */}
      <div className="mt-12 pt-8 border-t border-stone-100">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {legendType === 'CARE' ? (
            // 케어 기록 전용 범례 (병원, 지출, 일상)
            recordTypes.map(type => (
              <div key={type.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getMarkerColor(type.code, false)}`} />
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">{type.codeName}</span>
              </div>
            ))
          ) : (
            // 일정 예약 전용 범례 (접종, 예방약, 미용 등)
            scheduleTypes.filter(t => t.code !== 'ETC').map(type => (
              <div key={type.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getMarkerColor(type.code, false)}`} />
                <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">{type.codeName}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
