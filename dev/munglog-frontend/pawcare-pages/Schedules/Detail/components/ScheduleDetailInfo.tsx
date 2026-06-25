import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
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
            <span className={`px-3 py-1 rounded-lg text-[11px] font-black border ${
              schedule.isCompleted ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-main-green/5 text-main-green border-main-green/10'
            }`}>
              {schedule.isCompleted ? 'COMPLETED' : 'UPCOMING'}
            </span>
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

      <button
        type="button"
        onClick={onToggleComplete}
        className={`w-full h-[56px] rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
          schedule.isCompleted
            ? 'bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/20 shadow-none hover:bg-emerald-500/15'
            : 'bg-main-green text-white shadow-main-green/20 hover:shadow-main-green/40'
        }`}
      >
        {schedule.isCompleted ? (
          <><CheckCircle2 className="w-5 h-5" /> 완료됨 · 클릭하면 취소할 수 있어요</>
        ) : (
          <><Circle className="w-5 h-5" /> 완료 처리하기</>
        )}
      </button>

      <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
        schedule.inventoryItemId
          ? 'bg-main-green/5 border-main-green/10'
          : 'bg-surface-green/30 border-border'
      }`}>
        <span className="text-lg">📦</span>
        {schedule.inventoryItemId ? (
          <span className="text-[12px] font-bold text-foreground">
            <span className="text-main-green font-black">재고 연동됨</span> · {schedule.inventoryItemName} (재고 {schedule.inventoryItemStock ?? 0}개)
            {schedule.isCompleted ? ' · 완료 처리되어 재고가 차감되었습니다' : ' · 완료 처리하면 재고가 차감돼요'}
          </span>
        ) : (
          <span className="text-[12px] font-bold text-text-sub">
            재고 연동 안 됨 · 완료 처리해도 재고는 줄지 않아요. 수정에서 연동할 수 있어요.
          </span>
        )}
      </div>

    </div>
  );
};
