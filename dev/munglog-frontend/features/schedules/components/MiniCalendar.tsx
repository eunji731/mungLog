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

  const getMarkerColor = (typeCode: string) => {
    switch(typeCode) {
      case 'HOSPITAL': return 'bg-main-green';
      case 'GROOMING': return 'bg-blue-400';
      case 'MEDICINE':
      case 'HEARTWORM': return 'bg-green-400';
      case 'CHECKUP': return 'bg-purple-400';
      default: return 'bg-stone-400 dark:bg-stone-600';
    }
  };

  return (
    <div className="bg-background rounded-[32px] p-6 border border-border shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[16px] font-black text-foreground uppercase tracking-tight">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-text-sub/50 mb-2">{d}</div>
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
                ${isSelected ? 'bg-main-green text-white shadow-lg shadow-main-green/20 scale-110 z-10' : 'hover:bg-main-green/5'}
                ${!isCurrentMonth && !isSelected ? 'opacity-20' : ''}
              `}
            >
              <span className={`text-[12px] font-black tabular-nums ${isSelected ? 'text-white' : 'text-foreground'}`}>
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

      <div className="pt-4 border-t border-border">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {scheduleTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getMarkerColor(type.code)}`} />
              <span className="text-[10px] font-black text-text-sub uppercase tracking-tighter">
                {type.codeName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
