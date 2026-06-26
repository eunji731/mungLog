'use client';

import { RefreshCw, Sparkles } from 'lucide-react';
import { useDash } from '../context/DashboardContext';

interface AiEmptyStateProps {
  onRefresh: () => void;
  refreshing: boolean;
  remainingRefreshCount: number | null;
  recordCount: number | null;
}

export default function AiEmptyState({ onRefresh, refreshing, remainingRefreshCount, recordCount }: AiEmptyStateProps) {
  const { selectedYear, selectedMonth, isCurrentMonth } = useDash();
  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const count = recordCount ?? 0;
  const hasEnoughRecords = count >= 3;

  const RefreshButton = () => (
    <div className="space-y-2">
      <button
        onClick={onRefresh}
        disabled={refreshing || remainingRefreshCount === 0}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed rounded-full text-sm font-black transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? '생성 중...' : '리포트 생성'}
        {remainingRefreshCount !== null && !refreshing && (
          <span className="opacity-70">· 오늘 {remainingRefreshCount}회 남음</span>
        )}
      </button>
      {remainingRefreshCount === 0 && (
        <p className="text-xs font-bold opacity-50">오늘 새로고침 횟수를 모두 사용했어요</p>
      )}
    </div>
  );

  return (
    <div className="bg-deep-green rounded-[40px] p-10 text-white relative overflow-hidden min-h-[330px] lg:h-[330px] flex flex-col justify-center">
      <div className="relative z-10 text-center space-y-4 py-4">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7 text-main-yellow fill-main-yellow" />
        </div>
        <p className="font-black text-lg">{yearMonth} 리포트</p>

        {isCurrentMonth && !hasEnoughRecords && (
          <p className="text-sm font-bold opacity-70 leading-relaxed">
            이번 달 기록이 3개 이상 쌓이면<br />AI가 자동으로 월간 리포트를 작성해 드려요!
          </p>
        )}

        {isCurrentMonth && hasEnoughRecords && (
          <>
            <p className="text-sm font-bold opacity-70 leading-relaxed">
              리포트 생성 중 오류가 발생했어요.<br />새로고침 버튼을 눌러 다시 시도해 주세요.
            </p>
            <RefreshButton />
          </>
        )}

        {!isCurrentMonth && !hasEnoughRecords && (
          <p className="text-sm font-bold opacity-70 leading-relaxed">
            {selectedMonth}월 기록이 {count}개예요.<br />
            리포트 생성은 3개 이상의 기록이 필요해요.
          </p>
        )}

        {!isCurrentMonth && hasEnoughRecords && (
          <>
            <p className="text-sm font-bold opacity-70 leading-relaxed">
              이전 달 리포트는 자동으로 생성되지 않아요.<br />
              새로고침 버튼을 눌러 직접 생성할 수 있어요.
            </p>
            <RefreshButton />
          </>
        )}
      </div>
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
    </div>
  );
}
