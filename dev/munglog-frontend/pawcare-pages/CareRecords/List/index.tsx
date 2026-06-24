import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { useCareRecords } from './hooks/useCareRecords';
import { TimelineItem } from './components/TimelineItem';
import { FilterBar } from './components/FilterBar';
import { Calendar } from '@/components/common/Calendar';
import type { CalendarMarkers } from '@/components/common/Calendar';

const CareRecordListPage = () => {
  const navigate = useNavigate();
  const { records, calendarRecords, isLoading, filters, updateFilter } = useCareRecords();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 달력 마커 데이터 변환 (recordTypeId 기반으로 최적화)
  const calendarMarkers = useMemo(() => {
    const markers: CalendarMarkers = {};
    calendarRecords.forEach(record => {
      const date = record.recordDate;
      if (!markers[date]) markers[date] = [];
      
      // recordTypeId가 있으면 우선 사용 (숫자), 없으면 recordType (문자열) 사용
      // Calendar 컴포넌트는 string | number를 모두 수용합니다.
      const markerType = record.recordTypeId ?? (record as any).recordType;

      if (markerType) {
        markers[date].push({
          type: markerType as string | number
        });
      }
    });
    return markers;
  }, [calendarRecords]);

  // 달력의 달이 변경될 때 호출
  const handleMonthChange = useCallback((year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    setSelectedDate('');
    updateFilter({ startDate, endDate });
  }, [updateFilter]);

  const handleDateClick = (date: string) => {
    if (selectedDate === date) {
      const d = new Date(date);
      handleMonthChange(d.getFullYear(), d.getMonth() + 1);
    } else {
      setSelectedDate(date);
      updateFilter({ startDate: date, endDate: date });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[1500px]">
        <header className="pt-8 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-3">
            <h1 className="text-[48px] lg:text-[56px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
              Care <span className="text-[#FF6B00]">Log.</span>
            </h1>
            <p className="text-[16px] text-stone-400 font-medium max-w-xl">
              반려견의 건강 기록과 지출 흐름을 정교한 타임라인으로 관리하세요.
            </p>
          </div>
        </header>

        <section className="mb-6">
          <FilterBar filters={filters} onChange={updateFilter} />
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20">
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-12">
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-[#F0F0F0]">
              <Calendar
                markers={calendarMarkers}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                onMonthChange={handleMonthChange}
                legendType="CARE"
              />
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-stone-100 border-t-[#FF6B00] rounded-full animate-spin" />
              </div>
            ) : records.length > 0 ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {records.map(record => (
                  <TimelineItem key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center bg-white rounded-3xl border border-[#F0F0F0] shadow-sm px-10">
                <h3 className="text-[22px] font-black text-[#2D2D2D] mb-2 tracking-tight">No Records.</h3>
                <p className="text-stone-400 font-medium mb-8 text-[15px]">아직 기록된 로그가 없습니다.</p>
                <Button variant="outline" size="lg" className="rounded-xl px-10 border-[#EEEEEE] text-stone-600" onClick={() => navigate('/care-records/new')}>기록 시작하기</Button>
              </div>
            )}
          </div>
        </main>
      </PageLayout>
    </div>
  );
};

export default CareRecordListPage;
