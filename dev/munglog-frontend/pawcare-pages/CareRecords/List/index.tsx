import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { useCareRecords } from './hooks/useCareRecords';
import { TimelineItem } from './components/TimelineItem';
import { FilterBar } from './components/FilterBar';
import { Calendar } from '@/components/common/Calendar';
import type { CalendarMarkers } from '@/components/common/Calendar';

interface CareRecordListPageProps {
  showHeader?: boolean;
}

const CareRecordListPage = ({ showHeader = true }: CareRecordListPageProps) => {
  const router = useRouter();
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
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Care Records</span>
              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">반려견 케어기록</h1>
              <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">반려견의 건강 기록과 병원 지출 흐름을 체계적으로 모니터링하세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="mb-2">
            <FilterBar filters={filters} onChange={updateFilter} />
          </section>

          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-0">
              <div className="bg-background rounded-3xl p-6 border border-border shadow-sm">
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
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
                </div>
              ) : records.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {records.map(record => (
                    <TimelineItem key={record.id} record={record} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-background rounded-3xl border border-border shadow-sm px-10">
                  <h3 className="text-[20px] font-black text-foreground mb-2 tracking-tight">기록된 케어가 없습니다.</h3>
                  <p className="text-text-sub font-medium mb-6 text-sm">아직 기록된 로그가 없습니다.</p>
                  <Button variant="outline" size="md" className="rounded-xl px-8 border-border text-foreground hover:bg-surface-green" onClick={() => router.push('/care-records/new')}>기록 시작하기</Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CareRecordListPage;
