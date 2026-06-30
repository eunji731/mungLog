'use client';

import React, { useState } from 'react';
import { ShieldCheck, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { VaccinationSummaryItem } from '@/types/vaccination';
import VaccinationDDayBadge from './VaccinationDDayBadge';
import { scheduleApi } from '@/api/scheduleApi';

interface VaccinationSummaryCardProps {
  petId: string;
  summary: VaccinationSummaryItem[];
}

const VaccinationSummaryCard: React.FC<VaccinationSummaryCardProps> = ({ petId, summary }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [schedulingId, setSchedulingId] = useState<number | null>(null);

  if (summary.length === 0) return null;

  const hasCritical = summary.some(s => s.dDayInfo && s.dDayInfo.status !== 'OK');

  const handleCreateSchedule = async (item: VaccinationSummaryItem) => {
    if (!item.dDayInfo?.nextDueDate) return;
    setSchedulingId(item.vaccinationTypeId);
    try {
      await scheduleApi.createSchedule({
        petId,
        scheduleTypeId: 3, // VACCINATION
        title: `${item.vaccinationTypeName} 예방접종`,
        scheduleDate: `${item.dDayInfo.nextDueDate}T10:00:00`,
      });
    } catch {
      // 실패 시 무시
    } finally {
      setSchedulingId(null);
    }
  };

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-zinc-50/50">
      {/* 헤더 */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-100/60 transition-all"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-main-green" />
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">접종 D-Day 요약</p>
          {hasCritical && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black">
              주의
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown className="w-3.5 h-3.5 text-text-sub" />
          : <ChevronUp className="w-3.5 h-3.5 text-text-sub" />
        }
      </button>

      {!collapsed && (
        <div className="border-t border-border/40 divide-y divide-border/30">
          {summary.map(item => (
            <SummaryRow
              key={item.vaccinationTypeId}
              item={item}
              isScheduling={schedulingId === item.vaccinationTypeId}
              onCreateSchedule={() => handleCreateSchedule(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SummaryRow: React.FC<{
  item: VaccinationSummaryItem;
  isScheduling: boolean;
  onCreateSchedule: () => void;
}> = ({ item, isScheduling, onCreateSchedule }) => (
  <div className="px-4 py-3 flex items-center gap-3">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-black text-foreground">{item.vaccinationTypeName}</p>
        <VaccinationDDayBadge dDayInfo={item.dDayInfo} size="xs" />
      </div>
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <p className="text-[10px] text-text-sub font-medium">
          최근: {item.lastDate}
        </p>
        {item.dDayInfo?.nextDueDate && (
          <p className="text-[10px] text-text-sub font-medium">
            다음: {item.dDayInfo.nextDueDate}
          </p>
        )}
      </div>
    </div>

    {item.dDayInfo?.nextDueDate && (item.dDayInfo.status === 'SOON' || item.dDayInfo.status === 'OVERDUE') && (
      <button
        onClick={onCreateSchedule}
        disabled={isScheduling}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 bg-white hover:border-main-green hover:text-main-green text-text-sub text-[10px] font-bold transition-all disabled:opacity-50 shrink-0"
        title="다음 접종 일정 등록"
      >
        <Calendar className="w-3 h-3" />
        {isScheduling ? '등록 중...' : '일정 등록'}
      </button>
    )}
  </div>
);

export default VaccinationSummaryCard;
