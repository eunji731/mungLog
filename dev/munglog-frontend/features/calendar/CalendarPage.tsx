'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import CalendarHeader from '@/features/calendar/components/CalendarHeader';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import DiaryPreview from '@/features/diary/components/DiaryPreview';
import { Tabs } from '@/components/common/Tabs';
import DiaryEditor from '@/features/diary/components/DiaryEditor';
import MonthlyTimeline from '@/features/calendar/components/MonthlyTimeline';
import { useDiary, DailyLog } from '@/features/diary/hooks/useDiary';
import { useCalendar } from '@/features/calendar/hooks/useCalendar';
import { useCareRecords } from '@/features/care-records/hooks/useCareRecords';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import CalendarCarePanel from '@/features/calendar/components/CalendarCarePanel';
import CalendarSchedulePanel from '@/features/calendar/components/CalendarSchedulePanel';
import CareRecordFormPage from '@/features/care-records/pages/CareRecordFormPage';
import ScheduleFormPage from '@/features/schedules/pages/ScheduleFormPage';


function CalendarContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const dateParam = searchParams?.get('date');
  const modeParam = searchParams?.get('mode');
  const tabParam = searchParams?.get('tab') || 'petlog';

  // 달력용 케어 및 일정 데이터 연동
  const { calendarRecords, refetch: refetchCareRecords } = useCareRecords();
  const { schedules, refetch: refetchSchedules } = useSchedules();

  // URL에서 초기 날짜 계산 (렌더링 시점에 바로 결정)
  const getInitialDate = () => {
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      const parsed = new Date(year, month - 1, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  const initialDate = getInitialDate();

  const [isEditing, setIsEditing] = useState(false);
  // dateParam이 있고 mode가 timeline이 아니면 상세 창이 열린 상태로 시작
  const [showSidePanel, setShowSidePanel] = useState(!!dateParam && modeParam !== 'timeline');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTimelineMode, setIsTimelineMode] = useState(modeParam === 'timeline');

  const { addDailyLog, syncFromBackend } = useDiary();

  useEffect(() => { syncFromBackend(); }, []);
  const {
    currentDate,
    selectedDate,
    onPrevMonth,
    onNextMonth,
    onToday,
    goToDate,
    onSelectDate
  } = useCalendar(initialDate);

  const formattedSelectedDate = React.useMemo(() => {
    const offset = selectedDate.getTimezoneOffset();
    const localDate = new Date(selectedDate.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const handleCareAddNew = () => {
    setIsEditing(true);
    setShowSidePanel(true);
  };

  const handleCareSaveSuccess = () => {
    refetchCareRecords();
    setIsEditing(false);
    setShowSidePanel(false);
    setIsExpanded(false);
  };

  const handleCareCancel = () => {
    setIsEditing(false);
    setShowSidePanel(false);
    setIsExpanded(false);
  };

  const handleScheduleAddNew = () => {
    setIsEditing(true);
    setShowSidePanel(true);
  };

  const handleScheduleSaveSuccess = () => {
    refetchSchedules();
    setIsEditing(false);
    setShowSidePanel(false);
    setIsExpanded(false);
  };

  const handleScheduleCancel = () => {
    setIsEditing(false);
    setShowSidePanel(false);
    setIsExpanded(false);
  };

  // URL 파라미터가 변경될 때를 위한 처리 (이미 페이지에 있을 때 파라미터만 바뀌는 경우)
  useEffect(() => {
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);

      if (!isNaN(parsedDate.getTime())) {
        goToDate(parsedDate.getFullYear(), parsedDate.getMonth());
        onSelectDate(parsedDate);
        setIsEditing(false);

        if (modeParam === 'timeline') {
          setIsTimelineMode(true);
          setShowSidePanel(false);
        } else {
          setIsTimelineMode(false);
          setShowSidePanel(true);
        }
      }
    } else if (modeParam === 'timeline') {
      setIsTimelineMode(true);
    }
  }, [dateParam, modeParam, goToDate, onSelectDate]);

  const handleTabChange = (newTab: string) => {
    setIsExpanded(false);
    setIsEditing(false);
    setShowSidePanel(true);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', newTab);
    // 탭 이동 시 펫로그 고유 파라미터들은 제거
    params.delete('date');
    params.delete('mode');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateSelect = (date: Date) => {
    onSelectDate(date);
    setIsEditing(false);
    setShowSidePanel(true);
    setIsTimelineMode(false); // 날짜 선택 시 타임라인 모드 해제
  };

  const handleSave = (data: DailyLog) => {
    addDailyLog(data);
    setIsEditing(false);
    setShowSidePanel(false);
    setIsExpanded(false);
    syncFromBackend();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowSidePanel(false);
    setIsExpanded(false);
  };

  const handleEditRequest = () => {
    setIsEditing(true);
    setShowSidePanel(true);
  };

  const handleClosePanel = () => {
    setShowSidePanel(false);
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToday = () => {
    onToday();
    setIsEditing(false);
    if (window.innerWidth < 1024) {
      setShowSidePanel(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="bg-background border-b border-border shrink-0">
            <div className="max-w-[1600px] mx-auto w-full">
              <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                onToday={handleToday}
                onGoToDate={goToDate}
                onRecord={() => {
                  setIsEditing(true);
                  setShowSidePanel(true);
                  if (tabParam === 'petlog') {
                    setIsTimelineMode(false);
                  }
                }}
                isTimelineMode={tabParam === 'petlog' && isTimelineMode}
                onToggleView={() => {
                  if (tabParam !== 'petlog') return;
                  const nextMode = !isTimelineMode;
                  if (!nextMode) {
                    setIsExpanded(false);
                    setShowSidePanel(true);
                  }
                  setIsTimelineMode(nextMode);
                }}
                activeTab={tabParam}
                onTabChange={handleTabChange}
              />
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden flex-col lg:flex-row relative">
            {tabParam === 'petlog' && isTimelineMode ? (
              <MonthlyTimeline
                currentDate={currentDate}
                onDateSelect={handleDateSelect}
                initialDateRange={dateParam ? { start: dateParam, end: dateParam } : undefined}
              />
            ) : (
              <>
                {/* Main Calendar Area */}
                <div className={`flex-col min-h-0 bg-background p-2 lg:p-6 overflow-y-auto no-scrollbar transition-all duration-500 ${
                  isExpanded ? 'hidden lg:flex lg:w-0 lg:opacity-0 lg:invisible' : 'flex-1 flex lg:w-1/2 lg:flex-none'
                }`}>
                  <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                    <div className="flex-1 min-h-[400px]">
                      <CalendarGrid
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        currentDate={currentDate}
                        tab={tabParam as any}
                        careRecords={calendarRecords}
                        schedules={schedules}
                      />
                    </div>
                  </div>
                </div>

                {/* Side Panel: Preview, Editor, or Context Panel based on Tab */}
                <div className={`
                  ${showSidePanel ? 'fixed inset-0 z-[150] flex' : 'hidden'}
                  lg:relative lg:inset-auto lg:z-auto lg:flex
                  ${isExpanded ? 'lg:flex-1' : 'w-full lg:w-1/2'}
                  shrink-0 border-l border-border bg-background overflow-hidden flex-col transition-all duration-500
                `}>
                  {/* Expand/Collapse Toggle Button (Desktop Only, PetLog Only) */}
                  {tabParam === 'petlog' && (
                    <button
                      onClick={toggleExpand}
                      className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-[160] p-2 bg-background border border-border border-l-0 rounded-r-xl shadow-md hover:bg-surface-green transition-all group"
                      title={isExpanded ? "달력 보기" : "크게 보기"}
                    >
                      {isExpanded ? (
                        <ChevronRight className="w-4 h-4 text-text-main group-hover:translate-x-0.5 transition-transform" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 text-text-main group-hover:-translate-x-0.5 transition-transform" />
                      )}
                    </button>
                  )}

                  {tabParam === 'petlog' ? (
                    isEditing ? (
                      <DiaryEditor
                        date={selectedDate}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    ) : (
                      <DiaryPreview
                        date={selectedDate}
                        onEdit={handleEditRequest}
                        onClose={handleClosePanel}
                        isExpanded={isExpanded}
                      />
                    )
                  ) : tabParam === 'care' ? (
                    isEditing ? (
                      <CareRecordFormPage
                        prefillDate={formattedSelectedDate}
                        onSaveSuccess={handleCareSaveSuccess}
                        onCancel={handleCareCancel}
                        isEmbedded={true}
                      />
                    ) : (
                      <CalendarCarePanel
                        date={selectedDate}
                        careRecords={calendarRecords}
                        onClose={handleClosePanel}
                        onAddNew={handleCareAddNew}
                      />
                    )
                  ) : (
                    isEditing ? (
                      <ScheduleFormPage
                        prefillDate={formattedSelectedDate}
                        onSaveSuccess={handleScheduleSaveSuccess}
                        onCancel={handleScheduleCancel}
                        isEmbedded={true}
                      />
                    ) : (
                      <CalendarSchedulePanel
                        date={selectedDate}
                        schedules={schedules}
                        onClose={handleClosePanel}
                        onAddNew={handleScheduleAddNew}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-background text-sm font-bold text-text-sub">불러오는 중...</div>}>
      <CalendarContent />
    </Suspense>
  );
}
