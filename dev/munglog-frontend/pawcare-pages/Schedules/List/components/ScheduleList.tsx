import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Schedule } from '@/types/schedule';
import { calculateDDay } from '@/utils/dateUtils';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleListProps {
  schedules: Schedule[];
  onSelect: (id: string) => void;
  activeId: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ schedules, activeId }) => {
  const navigate = useNavigate();
  const { getCodeById } = useCommonCodes('SCHEDULE_TYPE');

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'MEDICAL': return '🏥';
      case 'GROOMING': return '✂️';
      case 'MEDICATION':
      case 'HEARTWORM': return '💊';
      case 'CHECKUP': return '🩺';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-3">
      {schedules.map(schedule => {
        const dDay = calculateDDay(schedule.scheduleDate);
        const dDayLabel = dDay === 0 ? 'Day' : dDay > 0 ? `-${dDay}` : `+${Math.abs(dDay)}`;
        const isPast = dDay < 0;

        const typeCode = schedule.scheduleTypeId 
          ? getCodeById(schedule.scheduleTypeId) 
          : String(schedule.scheduleTypeCode);

        return (
          <div 
            key={schedule.id}
            onClick={() => navigate(`/schedules/${schedule.id}`)}
            className={`group flex items-center justify-between p-5 rounded-[24px] border transition-all cursor-pointer hover:border-[#FF6B00] hover:shadow-lg hover:shadow-orange-500/5 active:scale-[0.99]
              ${activeId === schedule.id 
                ? 'bg-white border-[#FF6B00] shadow-xl shadow-orange-500/5' 
                : 'bg-white border-stone-100 shadow-sm'
              }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[20px] transition-colors
                ${activeId === schedule.id ? 'bg-[#FF6B00]/10' : 'bg-stone-50 group-hover:bg-stone-100'}`}>
                {getTypeIcon(typeCode)}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-black text-stone-400 uppercase tracking-tighter">
                  {new Date(schedule.scheduleDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </span>
                <span className={`text-[15px] font-black transition-colors ${activeId === schedule.id ? 'text-[#FF6B00]' : 'text-[#2D2D2D] group-hover:text-[#FF6B00]'}`}>
                  {schedule.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-black px-2 py-1 rounded-lg border tabular-nums
                ${activeId === schedule.id 
                  ? 'bg-[#FF6B00] text-white border-none' 
                  : isPast 
                    ? 'text-stone-300 border-stone-100' 
                    : 'text-[#FF6B00] border-[#FF6B00]/20 bg-orange-50'
                }`}>
                D{dDayLabel}
              </span>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${activeId === schedule.id ? 'text-[#FF6B00]' : 'text-stone-300 group-hover:text-[#FF6B00] group-hover:bg-stone-50'}`}>
                <span className="text-xl font-bold">→</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
