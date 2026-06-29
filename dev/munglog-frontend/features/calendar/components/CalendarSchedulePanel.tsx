'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar } from 'lucide-react';
import type { Schedule } from '@/types/schedule';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { Button } from '@/components/common/Button';
import { calculateDDay } from '@/utils/dateUtils';

interface CalendarSchedulePanelProps {
  date: Date;
  schedules: Schedule[];
  onClose: () => void;
  onAddNew?: () => void;
}

export default function CalendarSchedulePanel({ date, schedules, onClose, onAddNew }: CalendarSchedulePanelProps) {
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
        console.error('Failed to load snaps in CalendarSchedulePanel:', e);
      }
    };

    loadSnaps();

    window.addEventListener('symptom_snaps_updated', loadSnaps);
    return () => window.removeEventListener('symptom_snaps_updated', loadSnaps);
  }, []);

  const formattedDate = React.useMemo(() => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }, [date]);

  const displayDate = React.useMemo(() => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }, [date]);

  // 해당 날짜의 일정 필터링
  const filteredSchedules = React.useMemo(() => {
    return schedules.filter(s => s.scheduleDate.startsWith(formattedDate));
  }, [schedules, formattedDate]);

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      router.push(`/schedules/new?date=${formattedDate}`);
    }
  };

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

  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-surface-green/20">
        <div className="max-w-4xl mx-auto min-h-full bg-background shadow-2xl flex flex-col items-center justify-center p-10 text-center space-y-6">
          <div className="w-24 h-24 bg-surface-green rounded-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-main-green opacity-40" />
          </div>
          <div>
            <h3 className="text-xl font-black text-text-main">아직 일정이 없어요</h3>
            <p className="text-text-sub font-bold mt-2 leading-relaxed">이날 예정된 일정/예약이 없습니다.<br/>새로운 일정이나 예약을 작성해보세요.</p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={handleAddNew}
            className="rounded-xl border-border text-foreground hover:bg-surface-green px-6"
          >
            일정 등록하기
          </Button>
        </div>
      </div>
    </div>
  );

  if (filteredSchedules.length === 0) return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden relative shadow-[-12px_0_32px_rgba(0,0,0,0.03)]">
      <div className="sticky top-0 z-[20] bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 lg:px-5 lg:py-3.5 flex justify-between items-center shadow-sm shrink-0">
        <h2 className="text-base lg:text-lg font-bold text-text-main tracking-tight">{displayDate}</h2>
        <button onClick={onClose} className="p-2 hover:bg-surface-green rounded-xl transition-all">
          <X className="w-6 h-6 text-text-sub" />
        </button>
      </div>
      {renderEmptyState()}
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden shadow-[-12px_0_32px_rgba(0,0,0,0.03)] relative">
      {/* Header */}
      <div className="sticky top-0 z-[20] bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 lg:px-5 lg:py-3.5 flex justify-between items-center shadow-sm shrink-0">
        <h2 className="text-base lg:text-lg font-bold text-text-main tracking-tight">{displayDate}</h2>
        <button onClick={onClose} className="p-2 hover:bg-surface-green rounded-xl transition-all">
          <X className="w-6 h-6 text-text-sub" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-surface-green/20 space-y-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-2">
          <span className="text-xs font-bold text-text-sub">총 {filteredSchedules.length}개의 일정</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNew}
            className="rounded-xl border-border hover:border-main-green text-foreground hover:bg-surface-green text-xs px-3 h-8 shadow-sm"
          >
            + 일정 추가
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredSchedules.map((schedule) => {
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
                className="group flex flex-col p-6 bg-background rounded-[24px] border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[16px] bg-surface-green shrink-0">
                      {getTypeIcon(typeCode)}
                    </div>
                    <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase border shrink-0 bg-surface-green text-text-sub border-border">
                      {typeCode}
                    </span>
                    {/* 연동된 증상 뱃지 */}
                    {snapMap[String(schedule.id)] && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0 animate-in fade-in duration-300">
                        🚨 {snapMap[String(schedule.id)].symptomTags?.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border tabular-nums shrink-0 ${
                      isPast
                        ? 'text-text-sub/50 border-border'
                        : 'text-main-green border-main-green/20 bg-main-green/5'
                    }`}>
                      D{dDayLabel}
                    </span>
                    {schedule.isCompleted && (
                      <span className="text-xs shrink-0" title="완료됨">✅</span>
                    )}
                  </div>
                </div>

                <h4 className={`text-[17px] font-black tracking-tight leading-snug group-hover:text-main-green transition-colors mb-4 ${
                  schedule.isCompleted ? 'line-through text-text-sub/60' : 'text-foreground'
                }`}>
                  {schedule.title}
                </h4>

                {schedule.location && (
                  <div className="flex items-center gap-3 pt-3 border-t border-border mt-1">
                    <span className="text-[12px] font-bold text-text-sub flex items-center gap-1">
                      📍 {schedule.location}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
