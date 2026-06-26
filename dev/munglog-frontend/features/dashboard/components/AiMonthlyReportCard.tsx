'use client';

import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useDash } from '../context/DashboardContext';

interface AiMonthlyReportCardProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export default function AiMonthlyReportCard({ onRefresh, refreshing }: AiMonthlyReportCardProps) {
  const { aiReport } = useDash();

  if (!aiReport?.monthlyReport) return null;

  const report = aiReport.monthlyReport;
  const guardian = aiReport.guardianMessage;
  const next = aiReport.nextSuggestion;

  return (
    <div className="bg-deep-green rounded-[40px] p-8 lg:p-10 text-white relative overflow-hidden flex flex-col justify-between w-full h-full min-h-[350px] shadow-md">
      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-main-yellow fill-main-yellow" />
              <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">AI 월간 리포트</span>
            </div>
            <h3 className="text-xl font-black leading-tight">{report.headline}</h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing || (aiReport?.remainingRefreshCount ?? 1) === 0}
            title={`오늘 ${aiReport?.remainingRefreshCount ?? 0}회 남음`}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed relative group"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {(aiReport?.remainingRefreshCount ?? 0) > 0 && !refreshing && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-main-yellow rounded-full text-[9px] font-black text-white flex items-center justify-center">
                {aiReport?.remainingRefreshCount}
              </span>
            )}
          </button>
        </div>

        <p className="text-sm font-bold opacity-80 leading-relaxed">{report.narrative}</p>

        {(report.highlights?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">이달의 하이라이트</p>
            {report.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-main-yellow fill-main-yellow mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-black opacity-90">{h.title}</span>
                  {h.reason && <span className="text-xs opacity-60"> · {h.reason}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {(guardian || next) && (
          <div className="space-y-2 pt-4 border-t border-white/10">
            {guardian && (
              <p className="text-xs font-bold opacity-80 leading-relaxed">
                <span className="text-main-yellow font-black">보호자에게 · </span>{guardian}
              </p>
            )}
            {next && (
              <p className="text-xs font-bold opacity-80 leading-relaxed">
                <span className="text-main-green font-black">다음 달 팁 · </span>{next}
              </p>
            )}
          </div>
        )}

        {(report.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {report.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-black opacity-80">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-main-green/10 rounded-full blur-3xl" />
    </div>
  );
}
