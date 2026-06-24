import React from 'react';
import type { Schedule } from '@/types/schedule';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleDetailInfoProps {
  schedule: Schedule;
  onToggleComplete: () => void;
}

export const ScheduleDetailInfo: React.FC<ScheduleDetailInfoProps> = ({ schedule, onToggleComplete }) => {
  const { getCodeNameById, getCodeById, getCodeName } = useCommonCodes('SCHEDULE_TYPE');

  // 현재 아이템의 코드('MEDICAL' 등)와 한글 명칭('병원 진료' 등) 결정 (타입 안정성 보강)
  const typeCode = schedule.scheduleTypeId 
    ? getCodeById(schedule.scheduleTypeId) 
    : String(schedule.scheduleTypeCode || '');
    
  const typeName = schedule.scheduleTypeId 
    ? getCodeNameById(schedule.scheduleTypeId) 
    : getCodeName(String(schedule.scheduleTypeCode || ''));

  const typeIcon: Record<string, string> = {
    MEDICAL: '🏥',
    GROOMING: '✂️',
    MEDICATION: '💊',
    CHECKUP: '🩺',
    HEARTWORM: '💊',
    ETC: '📅'
  };

  const location = schedule.location || (schedule as any).location_info;

  return (
    <div className="flex flex-col gap-4">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-main-green rounded-[24px] p-6 flex flex-row md:flex-col justify-between items-center md:items-start md:min-h-[130px] shadow-lg shadow-main-green/20">
          <span className="text-white/70 text-[10px] font-black uppercase tracking-widest opacity-90">Time</span>
          <span className="text-white text-[24px] md:text-[28px] font-black tracking-tighter tabular-nums leading-none mt-0 md:mt-4">
            {new Date(schedule.scheduleDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="md:col-span-2 bg-background rounded-[24px] p-6 shadow-sm border border-border flex flex-col justify-between md:min-h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-text-sub text-[10px] font-black uppercase tracking-widest">Schedule Info</span>
            <div 
              className={`px-3 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                schedule.isCompleted ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-main-green/5 text-main-green border-main-green/10'
              }`} 
              onClick={onToggleComplete}
            >
              {schedule.isCompleted ? 'COMPLETED' : 'UPCOMING'}
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-foreground text-[18px] font-black tracking-tight">
              <span>{typeIcon[typeCode] || '📅'}</span>
              <span>{typeName || typeCode}</span>
            </div>
            
            {location && (
              <div className="flex items-center gap-2 pl-0 sm:pl-6 border-l-0 sm:border-l border-border h-full">
                <span className="text-lg text-main-green">📍</span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-foreground leading-tight truncate max-w-[200px]" title={location}>{location}</span>
                  <a 
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(location)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] font-black text-text-sub hover:text-main-green transition-colors underline decoration-border underline-offset-4"
                  >
                    View Map
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
