import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/common/Calendar';
import type { CalendarMarkers } from '@/components/common/Calendar';
import { ScheduleHeroCard } from './components/ScheduleHeroCard';
import { ScheduleList } from './components/ScheduleList';
import { useSchedules } from './hooks/useSchedules';
import { usePet } from '@/app/common/hooks/usePet';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { DatePicker } from '@/components/common/DatePicker';
import { parseISO, format } from 'date-fns';

interface ScheduleListPageProps {
  showHeader?: boolean;
}

const ScheduleListPage: React.FC<ScheduleListPageProps> = ({ showHeader = true }) => {
  const router = useRouter();
  const { schedules, isLoading, filters, updateFilter } = useSchedules();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const { pets: dogs } = usePet();

  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) =>
      new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime()
    );
  }, [schedules]);

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date);
    setActiveScheduleId(null);
  }, []);

  const handleMonthChange = useCallback((year: number, month: number) => {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    updateFilter({ startDate: start, endDate: end });
  }, [updateFilter]);

  const markers = useMemo(() => {
    const m: CalendarMarkers = {};
    sortedSchedules.forEach(s => {
      const date = s.scheduleDate.split('T')[0];
      if (!m[date]) m[date] = [];
      m[date].push({ type: s.scheduleTypeId || s.scheduleTypeCode as any });
    });
    return m;
  }, [sortedSchedules]);

  const selectedDateSchedules = useMemo(() => {
    return sortedSchedules.filter(s => s.scheduleDate.startsWith(selectedDate));
  }, [selectedDate, sortedSchedules]);

  const heroSchedule = useMemo(() => {
    if (activeScheduleId) {
      const found = sortedSchedules.find(s => s.id === activeScheduleId);
      if (found) return found;
    }
    if (selectedDateSchedules.length > 0) {
      return selectedDateSchedules[0];
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcoming = sortedSchedules.find(s => new Date(s.scheduleDate) >= now);
    return upcoming || sortedSchedules[0] || null;
  }, [selectedDateSchedules, sortedSchedules, activeScheduleId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Schedules</span>
              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">일정 및 예약</h1>
              <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">우리 아이의 진료 예약부터 복약 알림까지 모든 일정을 편리하게 관리하세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <section className="mb-2">
            <div className="bg-background rounded-3xl p-6 border border-border shadow-sm">
              <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">

                <div className="flex-grow flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow group">
                    <input
                      placeholder="어떤 일정을 찾으시나요?"
                      value={filters.keyword || ''}
                      onChange={(e) => updateFilter({ keyword: e.target.value })}
                      className="w-full bg-surface-green/10 h-[56px] pl-12 pr-6 rounded-2xl border border-border focus:border-main-green focus:bg-background outline-none text-[15px] font-medium text-foreground transition-all duration-300 shadow-inner"
                    />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-20 group-focus-within:opacity-100 transition-opacity">🔍</span>
                  </div>

                  <div className="relative sm:w-48 group">
                    <select
                      value={filters.dogId || ''}
                      onChange={(e) => updateFilter({ dogId: e.target.value || undefined })}
                      className="w-full h-[56px] px-6 rounded-2xl bg-surface-green/10 border border-border focus:border-main-green focus:bg-background text-[14px] font-black text-foreground appearance-none outline-none cursor-pointer transition-all duration-300 shadow-inner"
                    >
                      <option value="" className="bg-background text-foreground">모든 아이들 🐾</option>
                      {dogs.map((dog) => (
                        <option key={dog.id} value={dog.id} className="bg-background text-foreground">{dog.name}</option>
                      ))}
                    </select>
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub font-bold group-hover:text-main-green transition-colors">▼</span>
                  </div>

                  <div className="relative sm:w-40 group">
                    <select
                      value={filters.type || 'ALL'}
                      onChange={(e) => updateFilter({ type: e.target.value as any })}
                      className="w-full h-[56px] px-6 rounded-2xl bg-surface-green/10 border border-border focus:border-main-green focus:bg-background text-[14px] font-black text-foreground appearance-none outline-none cursor-pointer transition-all duration-300 shadow-inner"
                    >
                      <option value="ALL" className="bg-background text-foreground">전체 일정</option>
                      {scheduleTypes.map(type => (
                        <option key={type.id} value={type.code} className="bg-background text-foreground">{type.codeName}</option>
                      ))}
                    </select>
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub font-bold group-hover:text-main-green transition-colors">▼</span>
                  </div>
                </div>

                {/* 프리미엄 기간 카드 스타일 */}
                <div className="flex items-center px-5 h-[56px] bg-surface-green/10 rounded-2xl border border-border focus-within:border-main-green focus-within:bg-background transition-all shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="text-base opacity-30">📅</span>
                    <div className="flex items-center">
                      <div className="w-[95px]">
                        <DatePicker 
                          selected={filters.startDate ? parseISO(filters.startDate) : null}
                          onChange={(date) => updateFilter({ startDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                        />
                      </div>
                      <span className="text-text-sub font-light mx-1">~</span>
                      <div className="w-[95px]">
                        <DatePicker 
                          selected={filters.endDate ? parseISO(filters.endDate) : null}
                          onChange={(date) => updateFilter({ endDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button 
                    className="w-full h-[56px] px-8 bg-main-green text-white rounded-2xl font-black text-[15px] shadow-lg shadow-main-green/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    onClick={() => router.push('/schedules/new')}
                  >
                    <span className="text-lg">+</span>
                    일정 등록
                  </button>
                </div>
              </div>
            </div>
          </section>

          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-0">
              <div className="bg-background rounded-3xl p-6 border border-border shadow-sm">
                <Calendar
                  markers={markers}
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                  onMonthChange={handleMonthChange}
                  legendType="SCHEDULE"
                />
              </div>
            </div>

            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-text-sub uppercase tracking-widest px-2">Focus</h3>
                    {heroSchedule ? (
                      <ScheduleHeroCard schedule={heroSchedule} />
                    ) : (
                      <div className="py-16 text-center bg-background rounded-3xl border border-border shadow-sm">
                        <span className="text-3xl mb-3 block opacity-20">🗓️</span>
                        <h3 className="text-[16px] font-black text-foreground tracking-tight">No Events.</h3>
                        <p className="text-text-sub font-medium text-[13px]">선택한 날짜에 일정이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-text-sub uppercase tracking-widest px-2">Upcoming List</h3>
                    {sortedSchedules.length > 0 ? (
                      <ScheduleList
                        schedules={sortedSchedules}
                        onSelect={setActiveScheduleId}
                        activeId={heroSchedule?.id || ''}
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default ScheduleListPage;
