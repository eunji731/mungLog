import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateDDay } from '@/utils/dateUtils';
import type { Schedule } from '@/types/schedule';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { Calendar, ArrowLeft } from 'lucide-react';
import { getImagePath } from '@/app/common/lib/clientApi';
import { usePet } from '@/app/common/hooks/usePet';

interface ScheduleDetailHeaderProps {
  schedule: Schedule;
}

export const ScheduleDetailHeader: React.FC<ScheduleDetailHeaderProps> = ({ schedule }) => {
  const router = useRouter();
  const dDay = calculateDDay(schedule.scheduleDate);
  const dDayLabel = dDay === 0 ? 'Day' : dDay > 0 ? `-${dDay}` : `+${Math.abs(dDay)}`;
  const isPast = dDay < 0;

  const { getCodeName, getCodeNameById } = useCommonCodes('SCHEDULE_TYPE');

  const typeName = schedule.scheduleTypeId
    ? getCodeNameById(schedule.scheduleTypeId)
    : getCodeName(String(schedule.scheduleTypeCode || ''));

  const { pets } = usePet();
  const matchedPet = pets.find(p => String(p.id) === String(schedule.dogId || (schedule as any).petId));
  const raw = schedule as any;
  const dogProfileUrl = matchedPet?.photo || schedule.dogProfileImageUrl || raw.dog_profile_image_url;

  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/schedules')}
          className="flex items-center gap-2 text-text-sub hover:text-text-main text-[13px] font-black transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>목록으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-1.5 text-text-sub font-bold text-[13px] tabular-nums">
          <Calendar className="w-4 h-4 text-main-green" />
          <span>
            {new Date(schedule.scheduleDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-r from-light-green/20 via-background to-light-yellow/15 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-border p-6 md:p-8 rounded-[32px] shadow-xs">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 bg-main-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`px-3 py-1 rounded-full text-white text-[11px] font-black tracking-widest uppercase shadow-sm
                ${isPast ? 'bg-stone-400' : 'bg-red-500 shadow-red-500/20'}
              `}>
                D{dDayLabel}
              </div>

              <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border
                ${isPast
                  ? 'border-border text-text-sub bg-background dark:bg-zinc-800 shadow-xs'
                  : 'border-main-green/30 text-main-green bg-main-green/5 dark:bg-main-green/10'
                }`}>
                {typeName || '일정'}
              </span>

              {schedule.convertedCareRecordId && (
                <Link
                  href={`/care-records/${schedule.convertedCareRecordId}`}
                  className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                >
                  ✅ 케어기록 전환됨
                </Link>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-text-main leading-[1.2] lg:leading-[1.1] tracking-tight pr-4 break-keep">
              {schedule.title}<span className="text-main-green">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-background dark:bg-zinc-800 border border-border px-4 py-2.5 rounded-2xl shadow-xs self-start md:self-center shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-green border border-border shadow-xs flex items-center justify-center shrink-0">
              {dogProfileUrl ? (
                <img src={getImagePath(dogProfileUrl, 'profiles')} alt={schedule.dogName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[14px]">🐕</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[9px] font-black text-text-sub uppercase tracking-wider">Family</p>
              <span className="text-[14px] font-black text-text-main tracking-tight">{schedule.dogName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
