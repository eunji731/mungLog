import React from 'react';
import { useNavigate } from 'react-router-dom'; // 추가
import type { Schedule } from '@/types/schedule';
import { Badge } from '@/components/common/Badge';
import { calculateDDay } from '@/utils/dateUtils';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleHeroCardProps {
  schedule: Schedule;
}

export const ScheduleHeroCard: React.FC<ScheduleHeroCardProps> = ({ schedule }) => {
  const navigate = useNavigate(); // 추가
  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  if (!schedule) return null;
  
  const dDay = calculateDDay(schedule.scheduleDate);
  const dDayLabel = dDay === 0 ? 'Day' : dDay > 0 ? `-${dDay}` : `+${Math.abs(dDay)}`;
  const isPast = dDay < 0;

  let typeCode = String(schedule.scheduleTypeCode || '');
  if (schedule.scheduleTypeId) {
    typeCode = scheduleTypes.find(t => t.id === schedule.scheduleTypeId)?.code || typeCode;
  }

  const typeIcon: Record<string, string> = {
    MEDICAL: '🏥',
    GROOMING: '✂️',
    MEDICATION: '💊',
    CHECKUP: '🩺',
    ETC: '📅'
  };

  return (
    <div 
      onClick={() => navigate(`/schedules/${schedule.id}`)} // 전체 카드 클릭 시 상세 이동
      className="bg-[#2D2D2D] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-stone-300 relative overflow-hidden group cursor-pointer hover:ring-4 hover:ring-[#FF6B00]/20 transition-all active:scale-[0.99]"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-[#FF6B00]/20 duration-700"></div>

      <div className="relative z-10 space-y-8">
        {/* Top: D-Day & Icon */}
        <div className="flex items-center justify-between">
          <span className={`px-4 py-2 rounded-full text-white text-[13px] font-black tracking-widest uppercase shadow-lg
            ${isPast ? 'bg-stone-500 shadow-stone-500/20' : 'bg-red-500 shadow-red-500/30 animate-pulse'}
          `}>
            🚨 D{dDayLabel}
          </span>
          <span className="text-4xl drop-shadow-lg">{typeIcon[typeCode] || '📅'}</span>
        </div>

        {/* Title & Date */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-black text-white leading-tight tracking-tight break-keep">
              {schedule.title}
            </h2>
            {schedule.location && (
              <div className="flex items-center gap-1.5 text-white/50 font-bold text-[14px]">
                <span className="text-base">📍</span>
                <span>{schedule.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-stone-400 font-bold text-[15px]">
            <span className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></span>
               {new Date(schedule.scheduleDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </span>
            <span className="text-stone-600 hidden md:block">|</span>
            <span>{new Date(schedule.scheduleDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        {/* Memo Block */}
        {schedule.memo && (
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-[14px] font-bold text-stone-300 leading-relaxed">
              <span className="text-[#FF6B00] mr-2">Q.</span>
              {schedule.memo}
            </p>
          </div>
        )}

        {/* Tags */}
        {schedule.symptomTags && schedule.symptomTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {schedule.symptomTags.map(tag => (
              <Badge
                key={tag}
                className="bg-white/10! text-white! border-none! px-4! py-2! text-[12px]! rounded-xl!"
              >
                <span className="opacity-50 mr-1">#</span>{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <button className="px-6 h-[52px] rounded-xl text-stone-400 font-bold text-[14px] hover:text-white transition-all">
            ✏️ 수정
          </button>
          <button className="px-8 h-[52px] bg-[#FF6B00] text-white rounded-xl font-black text-[15px] shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95 transition-all">
            ✅ 케어기록으로 전환
          </button>
        </div>
      </div>
    </div>
  );
};
