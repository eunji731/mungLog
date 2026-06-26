'use client';

import { MapPin, Zap } from 'lucide-react';
import { useDash } from '../context/DashboardContext';

export default function AiLocationCard() {
  const { aiReport } = useDash();

  if (!aiReport?.locationInsight) return null;

  const loc = aiReport.locationInsight;

  const verdictConfig = {
    VARIED:   { icon: '🗺️', label: '다양한 장소형', desc: '여러 공간에서 다양한 추억을 남겼어요', bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600' },
    FOCUSED:  { icon: '📍', label: '한 장소 집중형', desc: '좋아하는 장소에서 깊이 있는 시간을 보냈어요', bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600' },
    ROUTINE:  { icon: '🔄', label: '반복 루틴형', desc: '정해진 장소를 꾸준히 방문하는 패턴이 있어요', bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-600' },
    LOW_DATA: { icon: '📝', label: '장소 기록 적음', desc: '장소 기록이 더 쌓이면 패턴을 분석할 수 있어요', bg: 'bg-gray-50 dark:bg-white/5', text: 'text-text-sub' },
  };

  const verdict = verdictConfig[loc.verdict as keyof typeof verdictConfig] ?? verdictConfig.LOW_DATA;

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 lg:p-8 space-y-5 w-full h-full flex flex-col justify-between">
      <div className="space-y-5 flex-1">
        <h3 className="font-black text-text-main flex items-center gap-2">
          <MapPin className="w-5 h-5 text-main-green" /> 이달의 장소 흐름
        </h3>

        <div className={`flex items-center gap-3 p-4 rounded-2xl ${verdict.bg}`}>
          <span className="text-2xl">{verdict.icon}</span>
          <div>
            <p className={`font-black text-sm ${verdict.text}`}>{verdict.label}</p>
            <p className={`text-xs font-bold ${verdict.text} opacity-70 mt-0.5`}>{verdict.desc}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {loc.verdict !== 'LOW_DATA' && (
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="p-3 bg-surface-green/50 rounded-xl text-center">
                <p className="text-xl font-black text-main-green">{loc.uniquePlaceCount}곳</p>
                <p className="text-[10px] font-black text-text-sub mt-0.5">방문 장소</p>
              </div>
              <div className="p-3 bg-background border border-border rounded-xl text-center">
                <p className="text-xl font-black text-text-main">{loc.placeRecordCount}일</p>
                <p className="text-[10px] font-black text-text-sub mt-0.5">총 외출</p>
              </div>
            </div>
          )}

          {loc.topPlace && (
            <div className="flex-1 flex items-center gap-2 p-3 bg-surface-green rounded-xl">
              <Zap className="w-4 h-4 text-main-green fill-main-green shrink-0" />
              <div>
                <p className="text-[10px] font-black text-main-green">가장 많이 간 곳</p>
                <p className="text-sm font-black text-text-main truncate">{loc.topPlace}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm font-bold text-text-sub leading-relaxed">{loc.message}</p>
    </div>
  );
}
