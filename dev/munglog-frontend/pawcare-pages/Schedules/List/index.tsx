import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Calendar } from '@/components/common/Calendar';
import type { CalendarMarkers } from '@/components/common/Calendar';
import { ScheduleHeroCard } from './components/ScheduleHeroCard';
import { ScheduleList } from './components/ScheduleList';
import { useSchedules } from './hooks/useSchedules';
import { dogApi } from '@/api/dogApi';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { DatePicker } from '@/components/common/DatePicker';
import { parseISO, format } from 'date-fns';
import type { Dog } from '@/types/dog';

const ScheduleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { schedules, isLoading, filters, updateFilter } = useSchedules();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);

  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  useEffect(() => {
    dogApi.getDogs().then(setDogs).catch(() => setDogs([]));
  }, []);

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
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[1500px]">

        <header className="pt-8 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-3">
            <h1 className="text-[48px] lg:text-[56px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
              Schedule <span className="text-[#FF6B00]">Plan.</span>
            </h1>
            <p className="text-[16px] text-stone-400 font-medium max-w-xl">
              우리 아이의 진료 예약부터 복약 알림까지, 모든 일정을 한눈에 관리하세요.
            </p>
          </div>
        </header>

        <section className="mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-[#F0F0F0]">
            <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">

              <div className="flex-grow flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow group">
                  <input
                    placeholder="어떤 일정을 찾으시나요?"
                    value={filters.keyword || ''}
                    onChange={(e) => updateFilter({ keyword: e.target.value })}
                    className="w-full bg-[#F9F9F9] h-[56px] pl-12 pr-6 rounded-xl border border-transparent focus:border-[#FF6B00] focus:bg-white outline-none text-[15px] font-medium transition-all duration-300 shadow-inner"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg opacity-20 group-focus-within:opacity-100 transition-opacity">🔍</span>
                </div>

                <div className="relative sm:w-48 group">
                  <select
                    value={filters.dogId || ''}
                    onChange={(e) => updateFilter({ dogId: e.target.value || undefined })}
                    className="w-full h-[56px] px-6 rounded-xl bg-[#F9F9F9] border border-transparent focus:border-[#FF6B00] focus:bg-white text-[14px] font-black appearance-none outline-none cursor-pointer transition-all duration-300 shadow-inner"
                  >
                    <option value="">모든 아이들 🐾</option>
                    {dogs.map((dog) => (
                      <option key={dog.id} value={dog.id}>{dog.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 font-bold group-hover:text-[#FF6B00] transition-colors">▼</span>
                </div>

                <div className="relative sm:w-40 group">
                  <select
                    value={filters.type || 'ALL'}
                    onChange={(e) => updateFilter({ type: e.target.value as any })}
                    className="w-full h-[56px] px-6 rounded-xl bg-[#F9F9F9] border border-transparent focus:border-[#FF6B00] focus:bg-white text-[14px] font-black appearance-none outline-none cursor-pointer transition-all duration-300 shadow-inner"
                  >
                    <option value="ALL">전체 일정</option>
                    {scheduleTypes.map(type => (
                      <option key={type.id} value={type.code}>{type.codeName}</option>
                    ))}
                  </select>
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 font-bold group-hover:text-[#FF6B00] transition-colors">▼</span>
                </div>
              </div>

              {/* [개편] 프리미엄 기간 카드 스타일 적용 */}
              <div className="flex items-center px-5 h-[56px] bg-[#F9F9F9] rounded-2xl border border-transparent focus-within:border-[#FF6B00] focus-within:bg-white transition-all shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-base opacity-30">📅</span>
                  <div className="flex items-center">
                    <div className="w-[95px]">
                      <DatePicker 
                        selected={filters.startDate ? parseISO(filters.startDate) : null}
                        onChange={(date) => updateFilter({ startDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                      />
                    </div>
                    <span className="text-stone-300 font-light mx-1">~</span>
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
                  className="w-full h-[56px] px-8 bg-[#FF6B00] text-white rounded-xl font-black text-[15px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate('/schedules/new')}
                >
                  <span className="text-lg">+</span>
                  일정 등록
                </button>
              </div>
            </div>
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-12">
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-[#F0F0F0]">
              <Calendar
                markers={markers}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                onMonthChange={handleMonthChange}
                legendType="SCHEDULE"
              />
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {isLoading ? (
              <div className="py-32 flex justify-center">
                <div className="w-10 h-10 border-4 border-stone-100 border-t-[#FF6B00] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <h3 className="text-[13px] font-black text-stone-400 uppercase tracking-widest px-2">Focus</h3>
                  {heroSchedule ? (
                    <ScheduleHeroCard schedule={heroSchedule} />
                  ) : (
                    <div className="py-24 text-center bg-white rounded-3xl border border-[#F0F0F0] shadow-sm">
                      <span className="text-4xl mb-4 block opacity-20">🗓️</span>
                      <h3 className="text-[18px] font-black text-[#2D2D2D] tracking-tight">No Events.</h3>
                      <p className="text-stone-400 font-medium text-[14px]">선택한 날짜에 일정이 없습니다.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-[13px] font-black text-stone-400 uppercase tracking-widest px-2">Upcoming List</h3>
                  {sortedSchedules.length > 0 ? (
                    <ScheduleList
                      schedules={sortedSchedules}
                      onSelect={setActiveScheduleId}
                      activeId={heroSchedule?.id || ''}
                    />
                  ) : (
                    <div className="p-10 text-center text-stone-300 font-bold border-2 border-dashed border-stone-100 rounded-3xl">
                      일정이 없습니다.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </PageLayout>
    </div>
  );
};

export default ScheduleListPage;
