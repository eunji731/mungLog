'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Trophy, Calendar, Pill } from 'lucide-react';
import { SCHEDULE_TYPE_CONFIG } from '../constants/scheduleTypeConfig';
import Skeleton from './Skeleton';
import { useExtra } from '../context/DashboardContext';
import type { ScheduleTypeConfig } from '../constants/scheduleTypeConfig';

function TypeBadge({ type, count, done }: { type: string; count: number; done: boolean }) {
  const cfg: ScheduleTypeConfig = SCHEDULE_TYPE_CONFIG[type] ?? SCHEDULE_TYPE_CONFIG.ETC;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${done ? 'bg-emerald-100/50 dark:bg-emerald-950/30' : cfg.bg}`}>
      <Icon className={`w-2.5 h-2.5 ${done ? 'text-emerald-600 dark:text-emerald-400' : cfg.color}`} />
      <span className={`text-[9px] font-black ${done ? 'text-emerald-600 dark:text-emerald-400' : cfg.color}`}>{cfg.label}</span>
      <span className="text-[9px] font-bold text-text-sub opacity-60">{count}</span>
    </div>
  );
}

export default function CareHubCard() {
  const { upcomingSchedules, monthSchedules, completedCount, pendingTypeStats, completedTypeStats, activeMedications, loading } = useExtra();
  const [showTooltip, setShowTooltip] = useState(false);

  const total = monthSchedules.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const r = 14.5;
  const circ = 2 * Math.PI * r;
  const greenDash = (pct / 100) * circ;
  const offset = circ * 0.25;

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-5 min-h-[330px] lg:h-[330px]">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-text-main flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-main-green" /> 케어 & 일정 허브
        </h3>
        <Link href="/schedules" className="text-[10px] font-black text-text-sub hover:text-main-green transition-colors">
          전체 일정 보기
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
          <Skeleton className="h-full w-full rounded-3xl" />
          <Skeleton className="h-full w-full rounded-3xl" />
          <Skeleton className="h-full w-full rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch flex-1">
          {/* 이달의 달성도 */}
          <div className="flex flex-col p-4 rounded-3xl bg-gradient-to-br from-emerald-50/30 to-green-50/10 dark:from-emerald-950/10 dark:to-transparent border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 shadow-sm min-h-[224px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                <Trophy className="w-3 h-3 text-emerald-500 fill-emerald-500" /> 이달의 달성도
              </span>
            </div>
            {total === 0 ? (
              <div className="flex-1 flex items-center justify-center py-6">
                <p className="text-xs text-text-sub font-bold">이번달 일정이 없어요</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-1 flex-1">
                <div
                  className="relative w-20 h-20 shrink-0 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-border/60" />
                    <circle
                      cx="18" cy="18" r={r} fill="none"
                      stroke="#10b981" strokeWidth="3"
                      strokeDasharray={`${greenDash} ${circ - greenDash}`}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-text-main leading-none">{pct}%</span>
                    <span className="text-[9px] font-bold text-text-sub mt-0.5">완료</span>
                  </div>

                  {showTooltip && (
                    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 dark:bg-gray-800/95 text-white text-[10px] p-2 rounded-xl shadow-xl border border-white/10 flex flex-col gap-1 pointer-events-none whitespace-nowrap">
                      <div className="flex items-center gap-1.5 px-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-black text-white/95">완료 일정: {completedCount}건</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="font-black text-white/95">남음 일정: {total - completedCount}건</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-1.5 pt-2 border-t border-emerald-500/5">
                  {pendingTypeStats.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center justify-center">
                      <span className="text-[9px] font-black text-orange-500/80 uppercase shrink-0 mr-1">남음</span>
                      {pendingTypeStats.slice(0, 2).map(({ type, count }) => (
                        <TypeBadge key={type} type={type} count={count} done={false} />
                      ))}
                    </div>
                  )}
                  {completedTypeStats.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center justify-center">
                      <span className="text-[9px] font-black text-emerald-600 uppercase shrink-0 mr-1">완료</span>
                      {completedTypeStats.slice(0, 2).map(({ type, count }) => (
                        <TypeBadge key={type} type={type} count={count} done={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 다가오는 일정 */}
          <div className="flex flex-col p-4 rounded-3xl bg-gradient-to-br from-blue-50/30 to-sky-50/10 dark:from-blue-950/10 dark:to-transparent border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 shadow-sm min-h-[224px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 bg-blue-100/60 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                <Calendar className="w-3 h-3 text-blue-500" /> 다가오는 일정
              </span>
              {upcomingSchedules.length > 0 && (
                <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {upcomingSchedules.length}건
                </span>
              )}
            </div>
            {upcomingSchedules.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-6 bg-background/40 rounded-2xl border border-blue-500/5">
                <p className="text-xs text-text-sub font-bold">예정된 일정이 없어요</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 flex flex-col justify-start">
                {upcomingSchedules.slice(0, 3).map(s => {
                  const cfg = SCHEDULE_TYPE_CONFIG[s.scheduleTypeCode as string] ?? SCHEDULE_TYPE_CONFIG.ETC;
                  const Icon = cfg.icon;
                  const dDayStyle = s.dDay === 0
                    ? 'bg-red-500 text-white shadow-sm shadow-red-200 dark:shadow-none'
                    : s.dDay <= 3
                    ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600';
                  return (
                    <Link
                      key={s.id}
                      href="/schedules"
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-background/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/20 border border-border/40 hover:border-blue-500/10 transition-all shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs font-black text-text-main truncate leading-tight">{s.title}</p>
                          <span className="text-[9px] font-bold text-text-sub mt-0.5 leading-none">{s.petName}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${dDayStyle}`}>
                        {s.dDay === 0 ? 'D-day' : `D-${s.dDay}`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 복약 중인 약 */}
          <div className="flex flex-col p-4 rounded-3xl bg-gradient-to-br from-orange-50/30 to-amber-50/10 dark:from-orange-950/10 dark:to-transparent border border-orange-500/10 hover:border-orange-500/20 transition-all duration-300 shadow-sm min-h-[224px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5 bg-orange-100/60 dark:bg-orange-950/40 px-2.5 py-1 rounded-full">
                <Pill className="w-3 h-3 text-orange-500" /> 복약 중인 약
              </span>
              {activeMedications.length > 0 && (
                <span className="text-[9px] font-black bg-orange-100 dark:bg-orange-900/20 text-orange-600 px-1.5 py-0.5 rounded-full">
                  {activeMedications.length}건
                </span>
              )}
            </div>
            {activeMedications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-6 bg-background/40 rounded-2xl border border-orange-500/5">
                <p className="text-xs text-text-sub font-bold">복약 중인 약이 없어요</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 flex flex-col justify-start">
                {activeMedications.slice(0, 3).map(r => (
                  <Link
                    key={r.id}
                    href="/care-records"
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-background/60 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 border border-border/40 hover:border-orange-500/10 transition-all shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-text-main truncate">{r.title}</p>
                      <p className="text-[9px] font-bold text-text-sub mt-0.5">{r.petName}</p>
                    </div>
                    {r.medicationDays && (
                      <span className="text-[9px] font-black text-orange-500 bg-orange-100/70 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                        {r.medicationDays}일 처방
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
