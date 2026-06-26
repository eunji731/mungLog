'use client';

import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useDash } from '../context/DashboardContext';

export default function AiActivityCard() {
  const { aiReport } = useDash();

  if (!aiReport?.activityInsight) return null;

  const a = aiReport.activityInsight;
  const personality = aiReport.personalityInsight;

  const trendConfig = {
    UP:      { icon: ArrowUp,   color: 'text-main-green', bg: 'bg-surface-green', label: '이전보다 활발해졌어요' },
    STABLE:  { icon: Minus,     color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/10',     label: '꾸준하게 유지 중이에요' },
    DOWN:    { icon: ArrowDown, color: 'text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10',  label: '이전보다 조금 줄었어요' },
    UNKNOWN: { icon: Minus,     color: 'text-gray-400',   bg: 'bg-gray-100 dark:bg-white/5',        label: '비교 데이터가 부족해요' },
  };
  const levelLabel = { GREAT: '활발', NORMAL: '보통', WATCH: '관찰 필요', WARNING: '관찰 필요', UNKNOWN: '-' };
  const levelColor = {
    GREAT:   'text-main-green bg-surface-green',
    NORMAL:  'text-blue-500 bg-blue-50 dark:bg-blue-900/10',
    WATCH:   'text-amber-600 bg-amber-50 dark:bg-amber-900/10',
    WARNING: 'text-orange-500 bg-orange-50 dark:bg-orange-900/10',
    UNKNOWN: 'text-gray-400 bg-gray-100 dark:bg-white/5',
  };

  const trendCfg = trendConfig[a.trend as keyof typeof trendConfig] ?? trendConfig.UNKNOWN;
  const TrendIcon = trendCfg.icon;
  const hasComparison = a.recentAverage != null && a.previousAverage != null && a.trend !== 'UNKNOWN';

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 lg:p-8 space-y-4 w-full h-full flex flex-col justify-between">
      <div className="space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-text-main flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-deep-green" /> 이달의 활동
          </h3>
          {a.level !== 'UNKNOWN' && (
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${levelColor[a.level as keyof typeof levelColor]}`}>
              {levelLabel[a.level as keyof typeof levelLabel]}
            </span>
          )}
        </div>

        {personality && (
          <div className="flex items-center gap-2 p-3 bg-surface-green/50 rounded-2xl">
            <span className="text-sm font-black text-main-green">{personality.label}</span>
            <span className="text-xs text-text-sub font-bold opacity-80">· {personality.message}</span>
          </div>
        )}

        <p className="text-sm font-bold text-text-main leading-relaxed">{a.message}</p>

        {hasComparison && (
          <div className={`flex items-center gap-3 p-3.5 rounded-2xl ${trendCfg.bg}`}>
            <TrendIcon className={`w-4 h-4 shrink-0 ${trendCfg.color}`} />
            <div>
              <p className={`text-xs font-black ${trendCfg.color}`}>{trendCfg.label}</p>
              <p className="text-[11px] text-text-sub font-bold mt-0.5">
                최근 2주 {a.recentAverage!.toFixed(1)} → 이전 2주 {a.previousAverage!.toFixed(1)}
                {a.confidence === 'LOW' && <span className="opacity-60"> (기록 적음, 참고용)</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-text-sub font-bold opacity-60">
        * 활동 에너지는 기록 저장 시 AI가 각 모멘트(산책·외출·휴식 등)에 자동 부여하는 활동 강도 점수(1~5)의 평균이에요.
      </p>
    </div>
  );
}
