'use client';

import React, { useState, createContext, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar, Heart, Sparkles, Zap, Plus,
  TrendingUp, MapPin, Flame, RefreshCw,
  ArrowUp, ArrowDown, Minus, PartyPopper, Trophy, Camera,
  ChevronLeft, ChevronRight,
  Stethoscope, Scissors, Shield, Activity, Pill,
  Package, AlertTriangle, CheckCircle2, Clock,
  BarChart3, CalendarCheck, Utensils, Star,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { useDashboard } from '@/app/common/hooks/useDashboard';
import { useDashboardExtra } from '@/app/common/hooks/useDashboardExtra';
import { getImagePath } from '@/app/common/lib/clientApi';
import DateDropdown from '@/app/calendar/components/DateDropdown';
import TimelineDatePicker from '@/app/calendar/components/TimelineDatePicker';

type DashboardCtxType = ReturnType<typeof useDashboard>;
const DashboardCtx = createContext<DashboardCtxType | null>(null);
function useDash() {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error('DashboardCtx not provided');
  return ctx;
}

type ExtraCtxType = ReturnType<typeof useDashboardExtra>;
const ExtraCtx = createContext<ExtraCtxType | null>(null);
function useExtra() {
  const ctx = useContext(ExtraCtx);
  if (!ctx) throw new Error('ExtraCtx not provided');
  return ctx;
}

// ─── 일정 타입 설정 ─────────────────────────────────────────────────────────

const SCHEDULE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  HOSPITAL:    { icon: Stethoscope,   color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/10',    label: '병원' },
  GROOMING:    { icon: Scissors,      color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', label: '미용' },
  VACCINATION: { icon: Shield,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/10',  label: '예방접종' },
  CHECKUP:     { icon: Activity,      color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/10', label: '건강검진' },
  MEDICINE:    { icon: Pill,          color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', label: '투약' },
  ETC:         { icon: CalendarCheck, color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-white/10',    label: '기타' },
};

const formatAmount = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}만원` : `${v.toLocaleString()}원`;

const EXPENSE_CAT_COLORS: Record<string, string> = {
  HOSPITAL: '#ef4444',
  MEDICINE: '#f97316',
  GROOMING: '#8b5cf6',
  FOOD: '#22c55e',
  SUPPLIES: '#3b82f6',
  ETC: '#94a3b8',
};

// ─── 스켈레톤 ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded-xl ${className}`} />;
}

// ─── 월 네비게이터 ──────────────────────────────────────────────────────────

function MonthNavigator() {
  const { selectedYear, selectedMonth, isCurrentMonth, goToPrevMonth, goToNextMonth, goToDate } = useDash();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const label = `${selectedYear}년 ${selectedMonth}월`;
  const currentDate = new Date(selectedYear, selectedMonth - 1);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevMonth}
        className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-surface-green transition-colors shadow-sm active:scale-90"
      >
        <ChevronLeft className="w-4 h-4 text-text-sub" />
      </button>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`px-3 py-1 rounded-xl transition-all active:scale-95 ${
            isDropdownOpen ? 'bg-main-green/10 text-main-green' : 'hover:bg-main-green/5'
          }`}
        >
          <span className="text-sm font-black text-text-main min-w-[80px] text-center">{label}</span>
        </button>

        {isDropdownOpen && (
          <DateDropdown
            currentDate={currentDate}
            onSelect={(y, m) => {
              goToDate(y, m);
              setIsDropdownOpen(false);
            }}
            onClose={() => setIsDropdownOpen(false)}
            align="right"
          />
        )}
      </div>

      <button
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-surface-green transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
      >
        <ChevronRight className="w-4 h-4 text-text-sub" />
      </button>
    </div>
  );
}

// ─── 상단 통합 헤더 컴포넌트 ────────────────────────────────────────────────────────

function DashboardHeader() {
  const { pets, selectedPetId } = usePet();
  const { summary, summaryLoading, selectedYear, selectedMonth, isCurrentMonth } = useDash();

  const petInfo = summary?.pet;
  const isAll = selectedPetId === ALL_PETS_ID;
  const primaryPet = pets.find(p => p.id === selectedPetId);
  const isBirthday = !isAll && petInfo?.birthdayDday === 0;

  const stats = summary?.monthlyStats;
  const streak = summary?.streak;
  const monthLabel = isCurrentMonth ? '이달의 활동' : `${selectedMonth}월 활동`;

  if (summaryLoading) {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 md:py-6 pb-2 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="flex items-stretch gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
          <Skeleton className="h-[52px] flex-1 md:w-28 rounded-2xl" />
          <Skeleton className="h-[52px] flex-1 md:w-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-6 py-4 md:py-6 pb-2">
      {/* 1. 펫 프로필 & 웰컴 메시지 영역 */}
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 shrink-0">
          <div className={`absolute inset-0 rounded-full shadow-sm ring-2 ${isBirthday ? 'ring-main-yellow animate-bounce' : 'ring-main-green/20'}`} />
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background bg-background shadow-inner">
            {isAll ? (
              <div className="w-full h-full bg-gradient-to-br from-main-green to-deep-green flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
              </div>
            ) : primaryPet ? (
              <Image src={getImagePath(primaryPet.photo, 'profiles')} alt={primaryPet.name} fill className="object-cover animate-in fade-in duration-300" />
            ) : (
              <div className="w-full h-full bg-surface-green flex items-center justify-center">
                <Plus className="w-6 h-6 text-main-green opacity-40" />
              </div>
            )}
          </div>
          {isBirthday && (
            <div className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-main-yellow rounded-full flex items-center justify-center shadow-md z-20">
              <PartyPopper className="w-3 text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-text-main tracking-tight">
              {isAll ? '안녕하세요, 모든 가족!' : `반갑습니다, ${petInfo?.name ?? '반려동물'}!`}
            </h1>
            {isBirthday && (
              <span className="bg-main-yellow/20 text-main-yellow dark:text-main-yellow text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse border border-main-yellow/30">
                🎉 오늘 생일!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-1 text-xs font-bold text-text-sub">
            {isAll ? (
              <span className="text-[11px] font-bold text-main-green bg-surface-green dark:bg-main-green/10 px-2 py-0.5 rounded-full">
                총 {pets.length}마리 반려 중
              </span>
            ) : petInfo ? (
              <>
                <span>{petInfo.breed}</span>
                <span className="text-border/80">•</span>
                <span>{petInfo.ageLabel}</span>
              </>
            ) : null}
            {!isAll && petInfo?.daysTogether != null && (
              <>
                <span className="text-border/80">•</span>
                <span className="text-main-green font-black">함께한 지 D+{petInfo.daysTogether}일</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. 우측 활동 정보 대시보드 영역 (스트릭 & 통계) */}
      <div className="flex items-stretch gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
        {/* 스트릭 위젯 */}
        <div className="flex-1 md:flex-none flex items-center gap-2.5 bg-background dark:bg-surface-green/5 hover:bg-light-green/20 dark:hover:bg-main-green/5 border border-border px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200">
          <div className="w-8 h-8 rounded-xl bg-main-yellow/10 flex items-center justify-center shrink-0">
            <Flame className="w-4.5 h-4.5 text-main-yellow fill-main-yellow shrink-0" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-sub leading-none mb-1">연속 기록</p>
            <p className="text-xs font-black text-text-main leading-none">{streak?.current ?? 0}일째</p>
          </div>
        </div>

        {/* 활동 요약 위젯 */}
        <div className="flex-1 md:flex-none flex flex-col justify-center bg-background dark:bg-surface-green/5 border border-border px-5 py-2.5 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-text-sub uppercase tracking-wider mb-1.5 text-center md:text-left">{monthLabel}</p>
          <div className="flex items-center justify-around md:justify-start gap-5">
            <div className="text-center min-w-[32px]">
              <p className="text-[10px] font-bold text-text-sub">기록</p>
              <p className="text-xs font-black text-text-main mt-0.5">{stats?.recordedDays ?? 0}일</p>
            </div>
            <div className="w-[1px] h-6 bg-border/80" />
            <div className="text-center min-w-[32px]">
              <p className="text-[10px] font-bold text-text-sub">장소</p>
              <p className="text-xs font-black text-text-main mt-0.5">{stats?.visitedPlaces ?? 0}곳</p>
            </div>
            <div className="w-[1px] h-6 bg-border/80" />
            <div className="text-center min-w-[32px]">
              <p className="text-[10px] font-bold text-text-sub">사진</p>
              <p className="text-xs font-black text-text-main mt-0.5">{stats?.bestPhotosCount ?? 0}장</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── 베스트 포토 ───────────────────────────────────────────────────────────

function BestPhotosStrip() {
  const { summary, summaryLoading } = useDash();
  const photos = (summary?.bestPhotos ?? []).slice(0, 4);

  if (summaryLoading) {
    return (
      <div className="space-y-4 w-full flex flex-col flex-1">
        <h2 className="text-lg font-black text-text-main flex items-center gap-2 px-1">
          <Trophy className="w-5 h-5 text-main-yellow fill-main-yellow" /> 베스트 포토
        </h2>
        <div className="grid grid-cols-2 gap-3 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="space-y-4 w-full flex flex-col flex-1">
        <h2 className="text-lg font-black text-text-main flex items-center gap-2 px-1">
          <Trophy className="w-5 h-5 text-main-yellow fill-main-yellow" /> 베스트 포토
        </h2>
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-8 text-center bg-surface-green/20 gap-2 flex-1">
          <Camera className="w-8 h-8 text-text-sub/40" />
          <div>
            <p className="text-xs font-black text-text-main">베스트 사진이 없어요</p>
            <p className="text-[10px] text-text-sub font-bold mt-1 leading-normal">반려견과의 하루 일기록에 멋진 사진을 올려주세요!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full flex flex-col flex-1">
      <h2 className="text-lg font-black text-text-main flex items-center gap-2 px-1">
        <Trophy className="w-5 h-5 text-main-yellow fill-main-yellow" /> 베스트 포토
      </h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {photos.map((photo, i) => (
          <Link
            key={i}
            href={`/calendar?date=${photo.memoryDate}`}
            className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all border border-border bg-background w-full"
          >
            <Image
              src={getImagePath(photo.photoPath)}
              alt="베스트 사진"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-black/55 backdrop-blur-sm rounded-full text-[10px] font-black text-white z-10">
              ★ {photo.vibeScore}
            </div>
            {photo.aiComment && (
              <p className="absolute bottom-2.5 left-2.5 right-2.5 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2 leading-relaxed z-10">
                {photo.aiComment}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── 자주 가는 곳 ──────────────────────────────────────────────────────────

function FavoritePlacesCard() {
  const { summary, summaryLoading } = useDash();
  const places = summary?.favoritePlaces ?? [];

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 lg:p-8 space-y-4 w-full h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-text-main flex items-center gap-2">
          <MapPin className="w-5 h-5 text-main-green" /> 자주 가는 곳
        </h3>
        <span className="text-[10px] font-black text-text-sub">이번 달 기준</span>
      </div>
      {summaryLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : places.length === 0 ? (
        <p className="text-sm text-text-sub font-bold text-center py-4">이번 달 방문 기록이 없어요</p>
      ) : (
        <div className="space-y-3">
          {places.map((place, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                i === 0 ? 'bg-main-yellow text-white' : i === 1 ? 'bg-border text-text-sub' : i === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-500' : 'bg-surface-green text-text-sub'
              }`}>
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-bold text-text-main truncate">{place.locationName}</span>
              <span className="text-xs font-black text-text-sub">{place.count}일</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI 섹션 ─────────────────────────────────────────────────────────────────

function AiEmptyState({ onRefresh, refreshing, remainingRefreshCount, recordCount }: {
  onRefresh: () => void;
  refreshing: boolean;
  remainingRefreshCount: number | null;
  recordCount: number | null;
}) {
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

// 월간 리포트 (헤더 카드)
function AiMonthlyReportCard({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  const { aiReport, isCurrentMonth } = useDash();

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

// 활동 에너지 카드
function AiActivityCard() {
  const { aiReport } = useDash();

  if (!aiReport?.activityInsight) return null;

  const a = aiReport.activityInsight;
  const personality = aiReport.personalityInsight;

  const trendConfig = {
    UP:      { icon: ArrowUp,   color: 'text-main-green', bg: 'bg-surface-green', label: '이전보다 활발해졌어요' },
    STABLE:  { icon: Minus,     color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/10',       label: '꾸준하게 유지 중이에요' },
    DOWN:    { icon: ArrowDown, color: 'text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10',     label: '이전보다 조금 줄었어요' },
    UNKNOWN: { icon: Minus,     color: 'text-gray-400',   bg: 'bg-gray-100 dark:bg-white/5',       label: '비교 데이터가 부족해요' },
  };
  const levelLabel = { GREAT: '활발', NORMAL: '보통', WATCH: '관찰 필요', WARNING: '관찰 필요', UNKNOWN: '-' };
  const levelColor = { GREAT: 'text-main-green bg-surface-green', NORMAL: 'text-blue-500 bg-blue-50 dark:bg-blue-900/10',
                       WATCH: 'text-amber-600 bg-amber-50 dark:bg-amber-900/10', WARNING: 'text-orange-500 bg-orange-50 dark:bg-orange-900/10', UNKNOWN: 'text-gray-400 bg-gray-100 dark:bg-white/5' };

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

        {/* 성향 뱃지 */}
        {personality && (
          <div className="flex items-center gap-2 p-3 bg-surface-green/50 rounded-2xl">
            <span className="text-sm font-black text-main-green">{personality.label}</span>
            <span className="text-xs text-text-sub font-bold opacity-80">· {personality.message}</span>
          </div>
        )}

        {/* AI 메시지 */}
        <p className="text-sm font-bold text-text-main leading-relaxed">{a.message}</p>

        {/* 수치 비교 - 데이터 있을 때만 */}
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

      {/* 에너지 기준 안내 */}
      <p className="text-[10px] text-text-sub font-bold opacity-60">
        * 활동 에너지는 기록 저장 시 AI가 각 모멘트(산책·외출·휴식 등)에 자동 부여하는 활동 강도 점수(1~5)의 평균이에요.
      </p>
    </div>
  );
}

// 장소 흐름 카드
function AiLocationCard() {
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

// ─── 케어 & 일정 허브 컴포넌트 ──────────────────────────────────────────────────

function CareHubCard() {
  const { upcomingSchedules, monthSchedules, completedCount, pendingTypeStats, completedTypeStats, activeMedications, loading } = useExtra();
  const total = monthSchedules.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const [showTooltip, setShowTooltip] = useState(false);

  // 도넛 SVG 계산
  const r = 14.5;
  const circ = 2 * Math.PI * r;
  const greenDash = (pct / 100) * circ;
  const offset = circ * 0.25;

  const TypeBadge = ({ type, count, done }: { type: string; count: number; done: boolean }) => {
    const cfg = SCHEDULE_TYPE_CONFIG[type] ?? SCHEDULE_TYPE_CONFIG.ETC;
    const Icon = cfg.icon;
    return (
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${done ? 'bg-emerald-100/50 dark:bg-emerald-950/30' : cfg.bg}`}>
        <Icon className={`w-2.5 h-2.5 ${done ? 'text-emerald-600 dark:text-emerald-400' : cfg.color}`} />
        <span className={`text-[9px] font-black ${done ? 'text-emerald-600 dark:text-emerald-400' : cfg.color}`}>{cfg.label}</span>
        <span className="text-[9px] font-bold text-text-sub opacity-60">{count}</span>
      </div>
    );
  };

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

          {/* 소주제 1: 이달의 달성도 */}
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

                  {/* 마우스 호버 툴팁 */}
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

          {/* 소주제 2: 다가오는 일정 */}
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

          {/* 소주제 3: 복약 중인 약 */}
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

// ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────

function buildExpenseData(records: import('@/types/care').CareRecord[], startDate: string, endDate: string) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59');
  start.setDate(1);

  const points: { month: string; total: number }[] = [];
  const d = new Date(start);
  while (d <= end) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    points.push({
      month: `${d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() + '/' : ''}${d.getMonth() + 1}월`,
      total: records
        .filter(r => r.recordDate?.startsWith(key) && r.amount && r.amount > 0)
        .reduce((sum, r) => sum + (r.amount ?? 0), 0),
    });
    d.setMonth(d.getMonth() + 1);
  }
  return points;
}

function buildCategoryStats(records: import('@/types/care').CareRecord[], startDate: string, endDate: string) {
  const EXPENSE_CAT_LABELS_LOCAL: Record<string, string> = {
    HOSPITAL: '병원비', MEDICINE: '약/영양제', GROOMING: '미용',
    FOOD: '사료/간식', SUPPLIES: '용품', ETC: '기타',
  };
  function cat(r: import('@/types/care').CareRecord) {
    if (r.recordType === 'EXPENSE') return r.categoryCode || 'ETC';
    if (r.recordType === 'HOSPITAL' || r.recordType === 'CHECKUP' || r.recordType === 'VACCINATION') return 'HOSPITAL';
    if (r.recordType === 'MEDICINE') return 'MEDICINE';
    if (r.recordType === 'GROOMING') return 'GROOMING';
    return 'ETC';
  }
  const filtered = records.filter(r =>
    r.recordDate >= startDate && r.recordDate <= endDate && r.amount && r.amount > 0
  );
  const totals: Record<string, number> = {};
  for (const r of filtered) {
    const c = cat(r);
    totals[c] = (totals[c] || 0) + (r.amount ?? 0);
  }
  return Object.entries(totals)
    .map(([code, total]) => ({ code, label: EXPENSE_CAT_LABELS_LOCAL[code] ?? code, total }))
    .sort((a, b) => b.total - a.total);
}

// ─── 자산 & 인벤토리 허브 컴포넌트 ────────────────────────────────────────────────

function AssetHubCard() {
  const { careRecords, loading } = useExtra();

  const defaultEnd = new Date().toLocaleDateString('en-CA');
  const defaultStart = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return d.toLocaleDateString('en-CA');
  })();

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const monthlyExpense = startDate && endDate ? buildExpenseData(careRecords, startDate, endDate) : [];
  const expenseCategoryStats = startDate && endDate ? buildCategoryStats(careRecords, startDate, endDate) : [];

  const hasData = monthlyExpense.some(m => m.total > 0);
  const maxVal = Math.max(...monthlyExpense.map(m => m.total), 1);
  const totalAmount = expenseCategoryStats.reduce((s, m) => s + m.total, 0);

  const pieData = expenseCategoryStats.map(({ code, label, total }) => ({
    name: label,
    value: total,
    pct: totalAmount === 0 ? 0 : Math.round((total / totalAmount) * 100),
    color: EXPENSE_CAT_COLORS[code] ?? '#94a3b8'
  }));
  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-5 min-h-[250px] lg:h-[250px]">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-text-main flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-deep-green" /> 생활 & 자산 관리
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          <Skeleton className="h-full w-full rounded-2xl" />
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1">
          {/* 왼쪽: 지출 현황 (col-span-7) */}
          <div className="md:col-span-7 flex flex-col justify-between gap-4 pr-0 md:pr-6 border-r-0 md:border-r border-dashed border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-black text-text-sub uppercase tracking-wider">지출 월별 추이</span>
              {/* 기간 선택 */}
              <div className="flex items-center gap-1 text-[11px]">
                <TimelineDatePicker
                  value={startDate}
                  onChange={v => { if (v <= endDate) setStartDate(v); }}
                  label="시작일"
                  variant="button"
                />
                <span className="text-text-sub/50">~</span>
                <TimelineDatePicker
                  value={endDate}
                  onChange={v => { if (v >= startDate) setEndDate(v); }}
                  label="종료일"
                  variant="button"
                />
              </div>
            </div>

            {!hasData ? (
              <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-border/40">
                <p className="text-xs text-text-sub font-bold">지출 기록이 없어요</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyExpense} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                        axisLine={false}
                        tickLine={false}
                        className="text-text-sub"
                      />
                      <YAxis
                        tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                        axisLine={false}
                        tickLine={false}
                        className="text-text-sub"
                        tickFormatter={v => v >= 10000 ? `${Math.floor(v / 10000)}만` : `${v}`}
                        width={30}
                      />
                      <Tooltip
                        formatter={(value) => [formatAmount(Number(value ?? 0)), '지출']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                        cursor={{ fill: 'rgba(34,197,94,0.08)' }}
                      />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {monthlyExpense.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.total === maxVal ? '#15803d' : entry.total > 0 ? '#22c55e' : '#e5e7eb'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 분야별 소비지출 도넛차트 (col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-between pl-0 md:pl-6 h-full gap-3">
            <span className="text-[10px] font-black text-text-sub uppercase tracking-wider block">분야별 소비 비율</span>

            {totalAmount === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-border/40 h-32">
                <p className="text-xs text-text-sub font-bold">소비 내역이 없어요</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-row items-center justify-between gap-4 h-32">
                {/* 도넛 그래프 */}
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={24}
                        outerRadius={40}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatAmount(Number(value ?? 0)), '지출']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 카테고리 범례 레전드 리스트 */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-32">
                  {pieData.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-text-sub truncate">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        <span className="text-text-main font-black">{entry.pct}%</span>
                        <span className="text-text-sub/40 text-[9px]">{formatAmount(entry.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 인벤토리 경고 컴포넌트 ───────────────────────────────────────────────────

function InventoryAlertCard() {
  const { lowStockItems, expiringItems, loading } = useExtra();
  const alertCount = lowStockItems.length + expiringItems.length;

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-4 min-h-[250px] lg:h-[250px] justify-between">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-text-main flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" /> 인벤토리 경고
          </h3>
          {alertCount > 0 && (
            <span className="text-[9px] font-black bg-red-50 dark:bg-red-900/10 text-red-500 px-1.5 py-0.5 rounded-full">
              {alertCount}건
            </span>
          )}
        </div>
        <Link href="/inventory" className="text-[10px] font-black text-text-sub hover:text-main-green transition-colors">
          전체 보기
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : lowStockItems.length === 0 && expiringItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-surface-green/10 rounded-2xl border border-main-green/5">
          <CheckCircle2 className="w-6 h-6 text-main-green opacity-40 mb-1" />
          <p className="text-xs text-main-green font-black">모든 재고 상태 양호</p>
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1 max-h-[140px] mt-1">
          {/* 재고 부족 아이템들 */}
          {lowStockItems.slice(0, 3).map(item => (
            <Link
              key={item.id}
              href="/inventory"
              className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100/40 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 transition-all text-xs"
            >
              <span className="font-black text-text-main truncate pr-2">{item.name}</span>
              <span className="text-[9px] font-black text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                {item.stock}개 남음
              </span>
            </Link>
          ))}
          {/* 유통기한 임박 아이템들 */}
          {expiringItems.slice(0, 3).map(item => {
            const daysLeft = Math.ceil(
              (new Date(item.expiryDateSpecific!).getTime() - Date.now()) / 86400000
            );
            return (
              <Link
                key={item.id}
                href="/inventory"
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 dark:bg-red-900/10 border border-red-100/40 hover:bg-red-100/60 dark:hover:bg-red-900/20 transition-all text-xs"
              >
                <span className="font-black text-text-main truncate pr-2">{item.name}</span>
                <span className="text-[9px] font-black text-red-500 bg-red-100 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                  {daysLeft === 0 ? '오늘 만료' : `D-${daysLeft}`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 꾸준한 일정 스트릭 컴포넌트 ─────────────────────────────────────────────────

function StreaksCard() {
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

// ─── 메인 대시보드 페이지 ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const dashboard = useDashboard();
  const extra = useDashboardExtra();
  const { aiReport, aiLoading, aiRefreshing, refreshAiReport } = dashboard;
  const { selectedPetId } = usePet();
  const isAll = selectedPetId === ALL_PETS_ID;
  const [refreshLimitToast, setRefreshLimitToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'care' | 'ai'>('care');

  React.useEffect(() => {
    if (!isAll && activeTab === 'ai') setActiveTab('care');
  }, [isAll, activeTab]);

  const handleRefresh = async () => {
    const result = await refreshAiReport();
    if (result === 'limit') {
      setRefreshLimitToast(true);
      setTimeout(() => setRefreshLimitToast(false), 3000);
    }
  };

  return (
    <ExtraCtx.Provider value={extra}>
    <DashboardCtx.Provider value={dashboard}>
    <div className="flex-1 flex flex-col min-h-0 bg-surface-green/30 overflow-y-auto no-scrollbar p-4 lg:p-8 animate-in fade-in duration-300">
      {refreshLimitToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl">
          오늘 새로고침 횟수(3회)를 모두 사용했어요
        </div>
      )}
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">

        {/* 1. 상단 레이아웃 (통합 펫 프로필 & 퀵 위젯 배너) */}
        <DashboardHeader />

        {/* 탭 네비게이션 */}
        <div className="flex flex-col gap-0 mt-0 mb-3 w-full select-none">
          <div className="flex justify-between items-center px-1 border-b border-border/80 w-full">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('care')}
                className={`relative pb-3 text-[15.5px] font-black cursor-pointer transition-all duration-200 outline-none flex items-center gap-2 select-none ${
                  activeTab === 'care'
                    ? 'text-main-green'
                    : 'text-text-sub hover:text-text-main'
                }`}
              >
                <Stethoscope className={`w-4.5 h-4.5 transition-transform ${activeTab === 'care' ? 'scale-105' : ''}`} />
                <span>케어 및 관리</span>
                {activeTab === 'care' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-main-green rounded-t-full animate-in fade-in duration-200" />
                )}
              </button>

              {isAll && (
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`relative pb-3 text-[15.5px] font-black cursor-pointer transition-all duration-200 outline-none flex items-center gap-2 select-none ${
                    activeTab === 'ai'
                      ? 'text-main-green'
                      : 'text-text-sub hover:text-text-main'
                  }`}
                >
                  <Sparkles className={`w-4.5 h-4.5 transition-all ${activeTab === 'ai' ? 'text-main-yellow fill-main-yellow scale-105' : ''}`} />
                  <span>AI 라이프 리포트</span>
                  {activeTab === 'ai' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-main-green rounded-t-full animate-in fade-in duration-200" />
                  )}
                </button>
              )}
            </div>

            {/* AI 탭일 때만 월 네비게이터 노출 */}
            {activeTab === 'ai' && (
              <div className="pb-2">
                <MonthNavigator />
              </div>
            )}
          </div>

          {!isAll && (
            <div className="flex items-start gap-2.5 mt-3 p-3.5 bg-surface-green/40 dark:bg-main-green/5 border border-main-green/10 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
              <Sparkles className="w-4.5 h-4.5 text-main-green shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-text-main">AI 라이프 리포트 안내</p>
                <p className="text-[11px] font-bold text-text-sub mt-0.5 leading-relaxed">
                  AI 라이프 리포트는 등록된 <span className="text-main-green font-black">전체 일기를 기준</span>으로 종합 분석하여 작성됩니다.
                  따라서 개별 반려동물을 선택했을 때는 리포트 탭이 노출되지 않으며, 오른쪽 사이드메뉴에서 <span className="text-main-green font-black">모든 가족</span>을 선택했을 때만 확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. 메인 컨텐츠 영역 */}
        {activeTab === 'care' ? (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* 통합 케어 허브 카드 (12열 가득 채워 3개 열의 가독성 극대화) */}
            <div className="w-full">
              <CareHubCard />
            </div>

            {/* 자산 및 생활 관리 허브 카드(8열) & 인벤토리 경고 카드(4열) - 높이 250px 완벽 매칭 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 flex">
                <div className="w-full flex flex-col">
                  <AssetHubCard />
                </div>
              </div>
              <div className="lg:col-span-4 flex">
                <div className="w-full flex flex-col">
                  <InventoryAlertCard />
                </div>
              </div>
            </div>

            {/* 꾸준한 일정 스트릭 카드 (12열 가득 채워 연속 완료 현황을 한눈에 표시) */}
            <div className="w-full">
              <StreaksCard />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {aiLoading ? (
              <div className="flex flex-col gap-6">
                {/* 첫째 줄 스켈레톤: 리포트 개요 (8열) + 베스트 포토 (4열) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 bg-deep-green rounded-[40px] p-8 space-y-4 min-h-[350px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-40 bg-white/20" />
                      <Skeleton className="h-4 w-full bg-white/20" />
                      <Skeleton className="h-4 w-5/6 bg-white/20" />
                    </div>
                  </div>
                  <div className="lg:col-span-4 bg-background rounded-[32px] border border-border p-6 lg:p-8 space-y-4 min-h-[350px] flex flex-col justify-between">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-2 gap-3 flex-1 mt-4">
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                    </div>
                  </div>
                </div>

                {/* 둘째 줄 스켈레톤: 좌측 2행 (활동 에너지, 장소 흐름) + 우측 (자주 가는 곳) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* 좌측 스켈레톤: 활동 에너지와 장소 흐름을 세로 배치 (8열) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-background rounded-[32px] border border-border p-6 space-y-4 h-52 flex flex-col justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="bg-background rounded-[32px] border border-border p-6 space-y-4 h-52 flex flex-col justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                  {/* 우측 스켈레톤: 자주 가는 곳 (4열) */}
                  <div className="lg:col-span-4 flex">
                    <div className="bg-background rounded-[32px] border border-border p-6 lg:p-8 space-y-4 w-full h-full flex flex-col justify-between">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-3 mt-6">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !aiReport?.hasData ? (
              <div className="w-full">
                <AiEmptyState
                  onRefresh={handleRefresh}
                  refreshing={aiRefreshing}
                  remainingRefreshCount={aiReport?.remainingRefreshCount ?? null}
                  recordCount={aiReport?.recordCount ?? null}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* 첫째 줄: 리포트 개요 (8열) + 베스트 포토 (4열) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 flex">
                    <AiMonthlyReportCard onRefresh={handleRefresh} refreshing={aiRefreshing} />
                  </div>
                  <div className="lg:col-span-4 flex">
                    <div className="w-full bg-background rounded-[32px] border border-border shadow-sm p-6 lg:p-8 flex flex-col justify-between min-h-[350px]">
                      <BestPhotosStrip />
                    </div>
                  </div>
                </div>

                {/* 둘째 줄: 좌측 2행 (활동 에너지, 장소 흐름) + 우측 (자주 가는 곳) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* 좌측: 활동 에너지와 장소 흐름을 세로로 배치 (8열) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex-1 flex">
                      <AiActivityCard />
                    </div>
                    <div className="flex-1 flex">
                      <AiLocationCard />
                    </div>
                  </div>
                  {/* 우측: 자주 가는 곳을 세로 높이에 맞춰 배치 (4열) */}
                  <div className="lg:col-span-4 flex">
                    <FavoritePlacesCard />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </DashboardCtx.Provider>
    </ExtraCtx.Provider>
  );
}
