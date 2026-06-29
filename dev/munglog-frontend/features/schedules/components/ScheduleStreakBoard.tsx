'use client';

import React, { useState } from 'react';
import { Flame, RotateCcw, Syringe, Scissors, Pill, Stethoscope, CalendarDays, PackageX } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { scheduleApi } from '@/api/scheduleApi';
import { useToast } from '@/app/common/hooks/useToast';
import { Spinner } from '@/components/common/Spinner';
import type { ScheduleStreak } from '@/types/schedule';

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  HOSPITAL: Stethoscope,
  GROOMING: Scissors,
  VACCINATION: Syringe,
  MEDICINE: Pill,
  MEDICATION: Pill,
  CHECKUP: Stethoscope,
  ETC: CalendarDays,
};

interface ScheduleStreakBoardProps {
  streaks: ScheduleStreak[];
  isLoading: boolean;
  onRecreated: () => void;
}

export default function ScheduleStreakBoard({ streaks, isLoading, onRecreated }: ScheduleStreakBoardProps) {
  const { success, error } = useToast();
  const [recreatingKey, setRecreatingKey] = useState<string | null>(null);

  const handleRecreate = async (streak: ScheduleStreak) => {
    const key = `${streak.petId}_${streak.title}`;
    const nextDate = streak.nextSuggestedDate
      ? parseISO(streak.nextSuggestedDate)
      : addDays(parseISO(streak.lastScheduleDate), 30);

    setRecreatingKey(key);
    try {
      await scheduleApi.createSchedule({
        petId: streak.petId,
        title: streak.title,
        scheduleType: streak.scheduleType,
        scheduleDate: format(nextDate, "yyyy-MM-dd'T'HH:mm:ss"),
        inventoryItemId: streak.inventoryItemId,
      });
      success(`'${streak.title}' 일정을 ${format(nextDate, 'M월 d일')}로 다시 등록했어요.`);
      onRecreated();
    } catch (err) {
      console.error('Failed to recreate schedule:', err);
      error('일정 재등록에 실패했습니다.');
    } finally {
      setRecreatingKey(null);
    }
  };

  return (
    <div className="bg-background rounded-[32px] border border-border p-5 md:p-6 shadow-sm flex flex-col gap-5">
      <div className="pb-3 border-b border-border space-y-0.5">
        <h3 className="text-base font-black text-text-main flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" /> 반복주기 스트릭
        </h3>
        <p className="text-[10px] text-text-sub font-bold">자주 등록한 일정의 연속 완료 현황</p>
      </div>

      {isLoading ? (
        <div className="h-[160px] flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      ) : streaks.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-surface-green/10">
          <Flame className="w-8 h-8 text-text-sub/30 mx-auto mb-2" />
          <p className="text-xs font-bold text-text-sub">같은 제목으로 2회 이상 등록하면</p>
          <p className="text-xs font-bold text-text-sub">여기에 반복 주기가 누적됩니다.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto no-scrollbar pr-1">
          {streaks.map((streak) => {
            const key = `${streak.petId}_${streak.title}`;
            const Icon = TYPE_ICON[streak.scheduleType] || CalendarDays;
            const isRecreating = recreatingKey === key;
            const nextDate = streak.nextSuggestedDate ? parseISO(streak.nextSuggestedDate) : null;

            return (
              <div key={key} className="p-3.5 border border-border rounded-2xl bg-background shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-main-green/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-main-green" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-text-main truncate">{streak.title}</p>
                      <p className="text-[10px] font-bold text-text-sub truncate">{streak.petName} · 총 {streak.totalCount}회</p>
                    </div>
                  </div>
                  {streak.streakCount > 0 && (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-black text-orange-600 bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded-full">
                      <Flame className="w-3 h-3" /> {streak.streakCount}연속
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {streak.recentOccurrences.map((occ, idx) => (
                    <div
                      key={idx}
                      title={`${format(parseISO(occ.scheduleDate), 'yyyy.MM.dd')} ${occ.completed ? '완료' : '미완료'}`}
                      className={`flex-1 h-2 rounded-full ${occ.completed ? 'bg-main-green' : 'bg-border'}`}
                    />
                  ))}
                </div>

                {streak.inventoryItemId && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold ${
                    streak.lowStockWarning
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20 text-red-600'
                      : 'bg-surface-green/40 border-border text-text-sub'
                  }`}>
                    <PackageX className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1">
                      {streak.inventoryItemName} 재고 {streak.inventoryItemStock ?? 0}개
                      {streak.stockDepletionDate && (
                        <> · {format(parseISO(streak.stockDepletionDate), 'M월 d일')} 소진 예상</>
                      )}
                      {streak.lowStockWarning && ' · 추가 구매가 필요해요!'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-border">
                  <span className="text-[10px] font-bold text-text-sub">
                    {nextDate ? `다음 예상 · ${format(nextDate, 'M월 d일')}` : '다음 일정 미정'}
                  </span>
                  <button
                    onClick={() => handleRecreate(streak)}
                    disabled={isRecreating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-main-green/10 hover:bg-main-green/20 text-main-green text-[11px] font-black rounded-full transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRecreating ? 'animate-spin' : ''}`} /> 재등록
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
