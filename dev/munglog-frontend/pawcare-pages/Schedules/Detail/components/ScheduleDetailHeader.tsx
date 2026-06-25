import React from 'react';
import Link from 'next/link';
import { calculateDDay } from '@/utils/dateUtils';
import type { Schedule } from '@/types/schedule';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleDetailHeaderProps {
  schedule: Schedule;
}

export const ScheduleDetailHeader: React.FC<ScheduleDetailHeaderProps> = ({ schedule }) => {
  const dDay = calculateDDay(schedule.scheduleDate);
  const dDayLabel = dDay === 0 ? 'Day' : dDay > 0 ? `-${dDay}` : `+${Math.abs(dDay)}`;
  const isPast = dDay < 0;

  // 일정 유형 명칭 변환을 위한 훅
  const { getCodeName, getCodeNameById } = useCommonCodes('SCHEDULE_TYPE');

  // ID가 있으면 ID로, 없으면 코드로 명칭 가져오기 (타입 안정성 보강)
  const typeName = schedule.scheduleTypeId 
    ? getCodeNameById(schedule.scheduleTypeId) 
    : getCodeName(String(schedule.scheduleTypeCode || ''));

  // 백엔드에서 전달받은 프로필 이미지 URL 사용 (Snake Case 대응 포함)
  const raw = schedule as any;
  const dogProfileUrl = schedule.dogProfileImageUrl || raw.dog_profile_image_url;

  return (
    <header className="pb-2">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border
            ${isPast ? 'border-border text-text-sub bg-background' : 'border-main-green/30 text-main-green bg-main-green/5'}`}>
            {typeName || '일정'}
          </span>
          <span className="text-[13px] font-black text-text-sub tabular-nums ml-1 tracking-widest">
            {new Date(schedule.scheduleDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).replace(/\. /g, '.').replace(/\.$/, '')}
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
        
        <h1 className="text-[36px] md:text-[44px] font-black text-foreground leading-[1.2] lg:leading-[1.1] tracking-tight word-break-keep-all pr-4">
          {schedule.title}<span className="text-main-green">.</span>
        </h1>

        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-green border border-border flex items-center justify-center shrink-0 overflow-hidden">
              {dogProfileUrl ? (
                <img src={dogProfileUrl} alt={schedule.dogName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[12px]">🐕</span>
              )}
            </div>
            <span className="text-[15px] font-black text-foreground tracking-tight">{schedule.dogName}</span>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-white text-[11px] font-black tracking-widest uppercase shadow-sm
            ${isPast ? 'bg-stone-400' : 'bg-red-500 shadow-red-500/20'}
          `}>
            D{dDayLabel}
          </div>
        </div>
      </div>
    </header>
  );
};
