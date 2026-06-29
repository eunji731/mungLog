import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Schedule } from '@/types/schedule';
import { calculateDDay } from '@/utils/dateUtils';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface ScheduleListProps {
  schedules: Schedule[];
  onSelect: (id: string) => void;
  activeIds: string[];
  onToggleComplete: (id: string) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ schedules, activeIds, onToggleComplete }) => {
  const router = useRouter();
  const { getCodeById } = useCommonCodes('SCHEDULE_TYPE');

  const [snapMap, setSnapMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadSnaps = () => {
      try {
        const snapData = localStorage.getItem('munglog_symptom_snaps');
        if (snapData) {
          const snaps = JSON.parse(snapData);
          const map: Record<string, any> = {};
          snaps.forEach((s: any) => {
            if (s.linkedScheduleId) {
              map[String(s.linkedScheduleId)] = s;
            }
          });
          setSnapMap(map);
        }
      } catch (e) {
        console.error('Failed to load snaps in ScheduleList:', e);
      }
    };

    loadSnaps();

    window.addEventListener('symptom_snaps_updated', loadSnaps);
    return () => window.removeEventListener('symptom_snaps_updated', loadSnaps);
  }, []);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'HOSPITAL': return '🏥';
      case 'GROOMING': return '✂️';
      case 'MEDICINE':
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
            onClick={() => router.push(`/schedules/${schedule.id}`)}
            className={`group flex items-center justify-between p-5 rounded-[24px] border transition-all cursor-pointer hover:border-main-green hover:shadow-lg hover:shadow-main-green/5 active:scale-[0.99]
              ${activeIds.includes(schedule.id)
                ? 'bg-background border-main-green shadow-xl shadow-main-green/5'
                : 'bg-background border-border shadow-sm'
              }`}
          >
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleComplete(schedule.id); }}
                title={schedule.isCompleted ? '완료 취소하기' : '완료 처리하기'}
                className="shrink-0 active:scale-90 transition-all"
              >
                {schedule.isCompleted ? (
                  <CheckCircle2 className="w-7 h-7 text-main-green fill-main-green/10" />
                ) : (
                  <Circle className="w-7 h-7 text-border hover:text-main-green transition-colors" />
                )}
              </button>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[20px] transition-colors
                ${activeIds.includes(schedule.id) ? 'bg-main-green/10' : 'bg-surface-green group-hover:bg-main-green/5'}`}>
                {getTypeIcon(typeCode)}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-black text-text-sub uppercase tracking-tighter">
                    {new Date(schedule.scheduleDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                  </span>
                  
                  {/* 연동된 증상 뱃지 */}
                  {snapMap[String(schedule.id)] && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-black animate-in fade-in duration-300 shrink-0">
                      🚨 {snapMap[String(schedule.id)].symptomTags?.join(', ')}
                    </span>
                  )}
                </div>
                <span className={`text-[15px] font-black transition-colors ${schedule.isCompleted ? 'text-text-sub/50 line-through' : activeIds.includes(schedule.id) ? 'text-main-green' : 'text-foreground group-hover:text-main-green'}`}>
                  {schedule.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-black px-2 py-1 rounded-lg border tabular-nums
                ${schedule.isCompleted
                  ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                  : activeIds.includes(schedule.id)
                    ? 'bg-main-green text-white border-none'
                    : isPast
                      ? 'text-text-sub/50 border-border'
                      : 'text-main-green border-main-green/20 bg-main-green/5'
                }`}>
                {schedule.isCompleted ? 'DONE' : `D${dDayLabel}`}
              </span>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${activeIds.includes(schedule.id) ? 'text-main-green' : 'text-text-sub/50 group-hover:text-main-green group-hover:bg-surface-green'}`}>
                <span className="text-xl font-bold">→</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
