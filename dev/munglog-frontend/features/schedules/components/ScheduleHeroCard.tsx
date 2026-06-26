import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, MapPin, Clock, FileText, Pencil } from 'lucide-react';
import type { Schedule } from '@/types/schedule';
import { Badge } from '@/components/common/Badge';
import { calculateDDay } from '@/utils/dateUtils';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleHeroCardProps {
  schedule: Schedule;
  onToggleComplete: (id: string) => void;
}

export const ScheduleHeroCard: React.FC<ScheduleHeroCardProps> = ({ schedule, onToggleComplete }) => {
  const router = useRouter();
  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  if (!schedule) return null;

  const dDay = calculateDDay(schedule.scheduleDate);
  const dDayLabel = dDay === 0 ? 'Day' : dDay > 0 ? `-${dDay}` : `+${Math.abs(dDay)}`;
  const isPast = dDay < 0;

  let typeCode = String(schedule.scheduleTypeCode || '');
  if (schedule.scheduleTypeId) {
    typeCode = scheduleTypes.find(t => t.id === schedule.scheduleTypeId)?.code || typeCode;
  }

  const typeName = scheduleTypes.find(t => t.id === schedule.scheduleTypeId || t.code === typeCode)?.codeName || '기타';

  const typeIcon: Record<string, string> = {
    MEDICAL: '🏥',
    GROOMING: '✂️',
    MEDICATION: '💊',
    CHECKUP: '🩺',
    ETC: '📅'
  };

  const dateObj = new Date(schedule.scheduleDate);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayOfWeek = weekDays[dateObj.getDay()];

  const timeString = dateObj.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div
      onClick={() => router.push(`/schedules/${schedule.id}`)}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7DBE7A] via-[#5C9E61] to-[#45844B] border border-emerald-400/30 shadow-xl shadow-main-green/10 group cursor-pointer transition-all duration-300 hover:border-emerald-300 hover:shadow-main-green/20"
    >
      {/* Decorative Glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-200/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-yellow-200/20 transition-all duration-500" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-300/15 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-300/25 transition-all duration-500" />

      {/* Distressed Stamp Watermark */}
      <div className="absolute right-24 top-6 border-4 border-dashed border-white/10 text-white/10 rounded-full w-24 h-24 flex items-center justify-center text-[10px] font-black tracking-[0.2em] uppercase -rotate-12 pointer-events-none select-none group-hover:border-white/15 group-hover:text-white/15 transition-all duration-500">
        CARE PASS
      </div>

      {/* Mobile Cutouts */}
      <div className="absolute left-0 top-[135px] -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border-r border-emerald-400/30 z-20 md:hidden transition-colors duration-300" />
      <div className="absolute right-0 top-[135px] translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background border-l border-emerald-400/30 z-20 md:hidden transition-colors duration-300" />
      <div className="absolute top-[135px] left-6 right-6 border-t-2 border-dashed border-white/20 z-10 md:hidden" />

      {/* Desktop Cutouts */}
      <div className="absolute top-0 left-[25%] -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border-b border-emerald-400/30 z-20 hidden md:block transition-colors duration-300" />
      <div className="absolute bottom-0 left-[25%] translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border-t border-emerald-400/30 z-20 hidden md:block transition-colors duration-300" />
      <div className="absolute top-6 bottom-6 left-[25%] border-l-2 border-dashed border-white/20 z-10 hidden md:block" />

      <div className="grid grid-cols-1 md:grid-cols-4 relative z-10">
        {/* Ticket Stub */}
        <div className="h-[135px] md:h-auto flex flex-col justify-center items-center p-6 md:p-8 text-center md:col-span-1 bg-black/5 relative overflow-hidden">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/10 tracking-[0.25em] uppercase select-none pointer-events-none [writing-mode:vertical-lr] rotate-180 hidden md:block">
            MUNGLOG CARE TICKET
          </span>

          <span className="text-xs font-black text-emerald-100 tracking-widest uppercase mb-1 drop-shadow-sm">
            {year}.{month}
          </span>
          <span className="text-[52px] md:text-[56px] font-black leading-none text-white tracking-tighter mb-1.5 drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
            {day}
          </span>
          <span className="text-[11px] font-black text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/10 mb-3 select-none">
            {dayOfWeek}
          </span>
          <div className="mt-auto md:mt-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-md
              ${schedule.isCompleted
                ? 'bg-emerald-600/30 text-white border border-emerald-400/40'
                : isPast
                  ? 'bg-stone-600/20 text-white/80 border border-white/20'
                  : 'bg-red-500/20 text-red-100 border border-red-400/30 animate-pulse'}
            `}>
              {schedule.isCompleted ? '✅ 완료됨' : `🚨 D${dDayLabel}`}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 md:p-8 flex flex-col justify-between md:col-span-3 md:pl-10 space-y-6">
          <div className="space-y-4 min-h-[130px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-white/20 text-white border border-white/25 shadow-sm">
                  <span className="text-sm leading-none">{typeIcon[typeCode] || '📅'}</span>
                  {typeName}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/10 text-white border border-white/15">
                  <Clock className="w-3.5 h-3.5 text-yellow-200" />
                  {timeString}
                </span>
              </div>

              <div className="hidden md:flex flex-col items-end gap-0.5 select-none pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity">
                <div className="flex items-end gap-0.5 h-6">
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[4px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[2px] h-full bg-white" />
                  <div className="w-[1px] h-full bg-white" />
                  <div className="w-[3px] h-full bg-white" />
                </div>
                <span className="text-[7px] font-mono tracking-widest text-white/70">
                  {String(schedule.id || 'SCHEDULE').slice(0, 8).toUpperCase()}
                </span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/schedules/edit/${schedule.id}`); }}
                className="p-2 rounded-lg border border-white/15 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-sm"
                title="일정 수정"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className={`text-xl md:text-2xl font-black text-white leading-tight tracking-tight break-keep group-hover:text-yellow-100 transition-colors duration-300 ${
                schedule.isCompleted ? 'line-through opacity-50' : ''
              }`}>
                {schedule.title}
              </h2>
              {schedule.location && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/15 text-white/90 border border-white/10 text-xs font-bold shadow-inner">
                  <MapPin className="w-3.5 h-3.5 text-yellow-200" />
                  <span>{schedule.location}</span>
                </div>
              )}
            </div>

            {schedule.memo && (
              <div className="relative p-4 bg-black/10 rounded-xl border-l-4 border-yellow-200/60 backdrop-blur-sm shadow-inner">
                <div className="flex gap-2 items-start">
                  <FileText className="w-4 h-4 text-yellow-100 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-bold text-white/90 leading-relaxed line-clamp-2">
                    {schedule.memo}
                  </p>
                </div>
              </div>
            )}

            {schedule.symptomTags && schedule.symptomTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {schedule.symptomTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/10 text-white/95 border border-white/10 text-[11px] font-bold hover:bg-white/20 transition-colors shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-white/15">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(schedule.id); }}
              className={`flex items-center gap-1.5 px-6 h-[44px] rounded-xl font-black text-[13px] shadow-lg transition-all active:scale-95 ${
                schedule.isCompleted
                  ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-none'
                  : 'bg-white text-[#45844B] hover:bg-yellow-50 hover:text-[#38713d] shadow-white/10'
              }`}
            >
              {schedule.isCompleted ? (
                <><CheckCircle2 className="w-4 h-4" /> 완료됨 (취소하기)</>
              ) : (
                <><Circle className="w-4 h-4" /> 완료 처리하기</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
