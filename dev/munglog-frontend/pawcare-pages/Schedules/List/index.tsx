import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Search, X, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import TimelineDatePicker from '@/app/calendar/components/TimelineDatePicker';
import { ScheduleHeroCard } from './components/ScheduleHeroCard';
import { ScheduleList } from './components/ScheduleList';
import ScheduleStreakBoard from './components/ScheduleStreakBoard';
import { useSchedules } from './hooks/useSchedules';
import { useScheduleStreaks } from './hooks/useScheduleStreaks';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { scheduleApi } from '@/api/scheduleApi';
import { useToast } from '@/app/common/hooks/useToast';

interface ScheduleListPageProps {
  showHeader?: boolean;
}

const ScheduleListPage: React.FC<ScheduleListPageProps> = ({ showHeader = true }) => {
  const router = useRouter();
  const { schedules, isLoading, filters, updateFilter, refetch } = useSchedules();
  const { streaks, isLoading: isStreaksLoading, refetch: refetchStreaks } = useScheduleStreaks();
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const { pets, selectedPetId } = usePet();
  const { success, error } = useToast();

  const handleRecreated = () => {
    refetch();
    refetchStreaks();
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const updated = await scheduleApi.toggleCompletion(id);
      success(updated.isCompleted ? '완료 처리했어요.' : '완료를 취소했어요.');
      refetch();
      refetchStreaks();
    } catch (err) {
      console.error('Toggle complete failed:', err);
      error('완료 처리에 실패했습니다.');
    }
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const petDisplayName = selectedPetId === ALL_PETS_ID ? '가족' : (selectedPet?.name || '아이');

  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  const [localKeyword, setLocalKeyword] = useState(filters.keyword ?? '');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalKeyword(filters.keyword ?? '');
  }, [filters.keyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateFilter({ keyword: localKeyword || undefined });
    }
  };

  const hasDateFilter = Boolean(filters.startDate || filters.endDate);

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) =>
      new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime()
    );
  }, [schedules]);

  const heroSchedules = useMemo(() => {
    if (activeScheduleId) {
      const found = sortedSchedules.find(s => s.id === activeScheduleId);
      return found ? [found] : [];
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySchedules = sortedSchedules.filter(s => {
      const d = new Date(s.scheduleDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === now.getTime();
    });
    if (todaySchedules.length > 0) return todaySchedules;

    const upcoming = sortedSchedules.find(s => new Date(s.scheduleDate) >= now);
    return upcoming ? [upcoming] : sortedSchedules.slice(0, 1);
  }, [sortedSchedules, activeScheduleId]);

  useEffect(() => { setHeroIndex(0); }, [heroSchedules.length, activeScheduleId]);

  const prevHero = useCallback(() => setHeroIndex(i => (i - 1 + heroSchedules.length) % heroSchedules.length), [heroSchedules.length]);
  const nextHero = useCallback(() => setHeroIndex(i => (i + 1) % heroSchedules.length), [heroSchedules.length]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-background text-text-main">
      <div className="w-full relative">

        {showHeader && (
          <div className="sticky top-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-border">
            <div className="w-full px-4 md:px-10 h-16 flex items-center justify-between gap-3 md:gap-8">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 bg-main-green/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-main-green" />
                </div>
                <h1 className="text-lg font-black tracking-tight whitespace-nowrap">
                  {petDisplayName}<span className="text-main-green"> 일정/예약</span>
                </h1>
              </div>

              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto no-scrollbar">
                <button
                  onClick={() => updateFilter({ type: 'ALL' })}
                  className={`px-4 py-1.5 text-[11px] font-black rounded-full transition-all whitespace-nowrap ${
                    filters.type === 'ALL'
                      ? 'bg-main-green/10 text-main-green'
                      : 'text-text-sub hover:text-main-green hover:bg-main-green/5'
                  }`}
                >
                  전체
                </button>
                {scheduleTypes.map((type) => {
                  const isActive = filters.type === type.code;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateFilter({ type: type.code })}
                      className={`px-4 py-1.5 text-[11px] font-black rounded-full transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-main-green/10 text-main-green'
                          : 'text-text-sub hover:text-main-green hover:bg-main-green/5'
                      }`}
                    >
                      {type.codeName}
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center bg-surface-green/50 rounded-full px-3 md:px-4 py-2 border border-transparent focus-within:border-main-green/30 focus-within:bg-background transition-all shadow-sm w-[150px] md:w-[220px] shrink-0">
                  <Search className="w-4 h-4 text-text-sub mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="일정 검색..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-[11px] font-bold text-text-main placeholder:text-text-sub/40 min-w-0"
                    value={localKeyword}
                    onChange={(e) => setLocalKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {localKeyword && (
                    <button onClick={() => { setLocalKeyword(''); updateFilter({ keyword: undefined }); }} className="ml-2 shrink-0">
                      <X className="w-3.5 h-3.5 text-text-sub hover:text-red-500" />
                    </button>
                  )}
                </div>

                <div className="relative" ref={dateFilterRef}>
                  <button
                    onClick={() => setShowDateFilter(prev => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-black transition-all border ${
                      hasDateFilter
                        ? 'bg-main-green/10 text-main-green border-main-green/30'
                        : 'bg-surface-green/50 text-text-sub border-transparent hover:text-main-green'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{hasDateFilter ? '기간 설정됨' : '기간'}</span>
                  </button>

                  {showDateFilter && (
                    <div className="absolute top-full right-0 mt-2 w-[340px] bg-background border border-border shadow-2xl rounded-[28px] p-4 z-[110] animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <TimelineDatePicker
                            value={filters.startDate || ''}
                            onChange={(date) => {
                              if (date && filters.endDate && date > filters.endDate) {
                                alert('시작일은 종료일보다 늦을 수 없습니다.');
                                return;
                              }
                              updateFilter({ startDate: date || undefined });
                            }}
                            label="시작일"
                            variant="button"
                          />
                        </div>
                        <span className="text-text-sub font-light shrink-0">~</span>
                        <div className="flex-1">
                          <TimelineDatePicker
                            value={filters.endDate || ''}
                            onChange={(date) => {
                              if (date && filters.startDate && date < filters.startDate) {
                                alert('종료일은 시작일보다 빠를 수 없습니다.');
                                return;
                              }
                              updateFilter({ endDate: date || undefined });
                            }}
                            label="종료일"
                            variant="button"
                          />
                        </div>
                      </div>
                      {hasDateFilter && (
                        <button
                          onClick={() => updateFilter({ startDate: undefined, endDate: undefined })}
                          className="mt-3 w-full text-[11px] font-black text-text-sub hover:text-main-green transition-colors text-center"
                        >
                          기간 초기화
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-4 shadow-md shadow-main-green/20 gap-1.5"
                  onClick={() => router.push('/schedules/new')}
                >
                  <Plus className="w-3.5 h-3.5" /> 일정 등록
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 md:px-8 pt-8 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Recurring Streak Board */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <ScheduleStreakBoard streaks={streaks} isLoading={isStreaksLoading} onRecreated={handleRecreated} />
            </div>

            {/* Right Column: Focus + Upcoming List */}
            <div className="lg:col-span-8 space-y-6">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-[11px] font-black text-text-sub uppercase tracking-widest">Focus</h3>
                      {heroSchedules.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button onClick={prevHero} className="w-6 h-6 flex items-center justify-center rounded-full border border-border text-text-sub hover:border-main-green hover:text-main-green transition-all">
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-black text-text-sub tabular-nums">
                            {heroIndex + 1} / {heroSchedules.length}
                          </span>
                          <button onClick={nextHero} className="w-6 h-6 flex items-center justify-center rounded-full border border-border text-text-sub hover:border-main-green hover:text-main-green transition-all">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {heroSchedules.length > 0 ? (
                      <ScheduleHeroCard
                        key={heroSchedules[heroIndex]?.id}
                        schedule={heroSchedules[heroIndex]}
                        onToggleComplete={handleToggleComplete}
                      />
                    ) : (
                      <div className="py-16 text-center bg-background rounded-3xl border border-border shadow-sm">
                        <span className="text-3xl mb-3 block opacity-20">🗓️</span>
                        <h3 className="text-[16px] font-black text-foreground tracking-tight">No Events.</h3>
                        <p className="text-text-sub font-medium text-[13px]">등록된 일정이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-text-sub uppercase tracking-widest px-2">Upcoming List</h3>
                    {sortedSchedules.length > 0 ? (
                      <ScheduleList
                        schedules={sortedSchedules}
                        onSelect={setActiveScheduleId}
                        activeIds={heroSchedules[heroIndex] ? [heroSchedules[heroIndex].id] : []}
                        onToggleComplete={handleToggleComplete}
                      />
                    ) : (
                      <div className="p-10 text-center text-text-sub/50 font-bold border border-border rounded-3xl bg-background">
                        일정이 없습니다.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleListPage;
