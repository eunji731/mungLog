'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { SCHEDULE_TYPE_CONFIG } from '../constants/scheduleTypeConfig';
import { useExtra } from '../context/DashboardContext';

export default function StreaksCard() {
  const { streaks } = useExtra();
  const activeStreaks = streaks.filter(s => s.streakCount >= 2).slice(0, 6);

  if (activeStreaks.length === 0) return null;

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-4">
      <h3 className="font-black text-text-main flex items-center gap-2">
        <Flame className="w-5 h-5 text-main-yellow fill-main-yellow" /> 꾸준한 일정
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeStreaks.map((s, i) => {
          const cfg = SCHEDULE_TYPE_CONFIG[s.scheduleType] ?? SCHEDULE_TYPE_CONFIG.ETC;
          const Icon = cfg.icon;
          return (
            <Link
              key={i}
              href="/schedules"
              className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-surface-green/30 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-text-main truncate">{s.title}</p>
                <p className="text-[10px] font-bold text-text-sub">{s.petName}</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-main-yellow fill-main-yellow" />
                  <span className="text-sm font-black text-text-main">{s.streakCount}</span>
                </div>
                <span className="text-[9px] font-bold text-text-sub">연속 완료</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
