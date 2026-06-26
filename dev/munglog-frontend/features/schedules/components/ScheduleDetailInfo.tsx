import React from 'react';
import type { Schedule } from '@/types/schedule';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleDetailInfoProps {
  schedule: Schedule;
}

export const ScheduleDetailInfo: React.FC<ScheduleDetailInfoProps> = ({ schedule }) => {
  const { getCodeNameById, getCodeById, getCodeName } = useCommonCodes('SCHEDULE_TYPE');

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

      {/* Time Widget */}
      <div className="bg-gradient-to-br from-main-green to-deep-green text-white rounded-3xl p-6 shadow-lg shadow-main-green/20 relative overflow-hidden flex flex-col justify-between min-h-[135px] group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <span className="text-white/80 text-[10px] font-black uppercase tracking-widest opacity-90">Time</span>
          <span className="text-lg">⏰</span>
        </div>
        <span className="text-white text-[24px] md:text-[28px] font-black tracking-tighter tabular-nums leading-none mt-4">
          {new Date(schedule.scheduleDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Schedule Info Widget */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-border flex flex-col justify-between min-h-[135px] hover:shadow-md hover:border-main-green/20 transition-all duration-300 group">
        <div className="flex justify-between items-start">
          <span className="text-text-sub text-[10px] font-black uppercase tracking-widest">Schedule Info</span>
          <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${
            schedule.isCompleted ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-main-green/5 text-main-green border-main-green/10'
          }`}>
            {schedule.isCompleted ? 'COMPLETED' : 'UPCOMING'}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-text-main text-lg font-black tracking-tight leading-snug">
          <span>{typeIcon[typeCode] || '📅'}</span>
          <span>{typeName || typeCode}</span>
        </div>
      </div>

      {/* Location Widget */}
      {location && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-border flex flex-col justify-between min-h-[135px] hover:shadow-md hover:border-main-green/20 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-text-sub text-[10px] font-black uppercase tracking-widest">Location</span>
            <span className="text-lg text-main-green">📍</span>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-[14px] font-bold text-text-main leading-tight truncate" title={location}>{location}</span>
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black text-text-sub hover:text-main-green transition-colors underline decoration-border underline-offset-4 mt-1.5 self-start"
            >
              View Map
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
