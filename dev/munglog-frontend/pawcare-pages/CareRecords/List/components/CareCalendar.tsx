import React, { useState, useMemo, useEffect } from 'react';
import type { CareRecord } from '@/types/care';
import { buildCalendarDays, buildMarkersByDate, getMonthLabel, moveMonth } from '@/utils/dateUtils';

interface CareCalendarProps {
  records: CareRecord[];
  selectedDate?: string;
  onDateClick?: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export const CareCalendar: React.FC<CareCalendarProps> = ({ 
  records, 
  selectedDate, 
  onDateClick,
  onMonthChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const markersByDate = useMemo(() => buildMarkersByDate(records, currentMonth), [records, currentMonth]);
  const monthLabel = getMonthLabel(currentMonth);

  // 달이 변경될 때 부모에게 알림
  useEffect(() => {
    onMonthChange?.(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }, [currentMonth, onMonthChange]);

  return (
    <div className="select-none text-[#2D2D2D]">
      <header className="flex justify-between items-center mb-8 px-2">
        <h3 className="text-[32px] font-black tracking-tighter leading-none">
          {monthLabel}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(prev => moveMonth(prev, -1))} 
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#EEEEEE] hover:bg-stone-50 transition-all active:scale-90 cursor-pointer"
          >
            ◀
          </button>
          <button 
            onClick={() => setCurrentMonth(prev => moveMonth(prev, 1))} 
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#EEEEEE] hover:bg-stone-50 transition-all active:scale-90 cursor-pointer"
          >
            ▶
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 text-center">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
          <div key={d} className={`text-[10px] font-black tracking-[0.2em] pb-6 ${i === 0 ? 'text-red-400/70' : 'text-text-sub/65'}`}>
            {d}
          </div>
        ))}

        {calendarDays.map((day) => {
          const { dateString, dayNumber, isCurrentMonth, isToday } = day;
          const hasMedical = markersByDate[dateString]?.medical;
          const hasExpense = markersByDate[dateString]?.expense;
          const isSelected = selectedDate === dateString;

          return (
            <div 
              key={dateString} 
              onClick={() => onDateClick?.(dateString)}
              className={`relative h-[68px] flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer group
                ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                ${isSelected 
                  ? 'bg-main-green shadow-lg shadow-main-green/20 scale-105 z-10' 
                  : 'hover:bg-main-green/5'}
              `}
            >
              <span className={`text-[17px] font-bold tabular-nums transition-colors duration-300 ${
                isSelected 
                  ? 'text-white' 
                  : isToday 
                    ? 'text-main-green border-b-2 border-main-green' 
                    : 'text-foreground'
              }`}>
                {dayNumber}
              </span>

              <div className="flex gap-1.5 mt-1.5 h-1.5 items-center">
                {hasMedical && (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-main-green'
                  }`} />
                )}
                {hasExpense && (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white/60' : 'bg-main-yellow'
                  }`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
