'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useCalendar } from '../hooks/useCalendar';
import { useDiary } from '@/features/diary/hooks/useDiary';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/app/common/lib/clientApi';

// Helpers to get metadata for care and schedule items to style them beautifully
const getRecordTypeMeta = (care: any) => {
  const rawRecord = care as any;
  let typeCode = String(rawRecord.recordType || '');
  if (care.recordTypeId || rawRecord.record_type_id) {
    const typeId = care.recordTypeId || rawRecord.record_type_id;
    if (Number(typeId) === 1) typeCode = 'MEDICAL';
  }
  
  switch (typeCode) {
    case 'HOSPITAL':
    case 'MEDICAL':
      return { icon: '🏥', label: '병원', bg: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/30' };
    case 'MEDICINE':
      return { icon: '💊', label: '투약', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/30' };
    case 'GROOMING':
      return { icon: '🧼', label: '미용', bg: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/30' };
    case 'VACCINATION':
      return { icon: '💉', label: '접종', bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/30' };
    case 'CHECKUP':
      return { icon: '🩺', label: '검진', bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/30' };
    case 'EXPENSE':
      return { icon: '🪙', label: '지출', bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/30' };
    case 'ETC':
    default:
      return { icon: '📝', label: '기타', bg: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700/30' };
  }
};

const getScheduleTypeMeta = (sch: any) => {
  const typeCode = String(sch.scheduleType || '');
  const isCompleted = sch.isCompleted;
  
  let icon = '⏰';
  if (isCompleted) {
    icon = '✅';
  } else {
    switch (typeCode) {
      case 'HOSPITAL':
        icon = '🏥';
        break;
      case 'MEDICINE':
        icon = '💊';
        break;
      case 'GROOMING':
        icon = '🧼';
        break;
      case 'VACCINATION':
        icon = '💉';
        break;
      case 'CHECKUP':
        icon = '🩺';
        break;
      case 'ETC':
      default:
        icon = '⏰';
        break;
    }
  }

  const bg = isCompleted 
    ? 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-70 dark:bg-gray-800/40 dark:text-gray-505 dark:border-gray-700/30'
    : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/30';

  return { icon, label: sch.title || '일정', bg };
};

export default function CalendarGrid({ 
  onDateSelect, 
  selectedDate,
  currentDate,
  tab = 'petlog',
  careRecords = [],
  schedules = []
}: { 
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  currentDate: Date;
  tab?: 'petlog' | 'care' | 'schedule';
  careRecords?: any[];
  schedules?: any[];
}) {
  const { dailyLogs } = useDiary();
  const { selectedPetId } = usePet();

  // Helper to generate days for the current month view
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Previous month days
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const days = generateDays();

  const getDayContent = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    const dateKey = localDate.toISOString().split('T')[0];
    const logs = dailyLogs[dateKey] || [];
    
    // 필터링된 결과 확인
    if (selectedPetId !== ALL_PETS_ID) {
      return logs.filter(log => log.moments.some(m => m.dogIds.includes(selectedPetId || '')));
    }
    
    return logs;
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-xl lg:rounded-2xl shadow-sm overflow-hidden border border-border">
      <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] min-h-0">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <div key={day} className={`py-3 text-center text-[10px] font-black uppercase tracking-widest bg-background border-b border-border ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-text-sub/60'}`}>
            {day}
          </div>
        ))}
        
        {days.map((day, i) => {
          const logs = getDayContent(day.date);
          const hasLogs = logs.length > 0;
          const isSelected = selectedDate.toDateString() === day.date.toDateString();
          const isToday = new Date().toDateString() === day.date.toDateString();

          return (
            <div 
              key={i}
              className={`relative flex flex-col items-center justify-start p-1 lg:p-2 transition-all group cursor-pointer border-b border-r border-border last:border-r-0 ${
                day.isCurrentMonth ? 'bg-background' : 'bg-surface-green/5'
              } ${isSelected ? 'bg-main-green/5' : 'hover:bg-surface-green/20'}`}
              onClick={() => onDateSelect(day.date)}
            >
              {/* Selection Border - Inset to never overflow */}
              {isSelected && (
                <div className="absolute inset-0 border-2 border-main-green/30 pointer-events-none" />
              )}

              {/* Date Number */}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <span className={`text-[11px] lg:text-sm font-black transition-all ${
                  isToday ? 'text-main-green' : 
                  isSelected ? 'text-main-green' : 
                  day.isCurrentMonth ? 'text-text-main' : 'text-text-sub/30'
                }`}>
                  {day.date.getDate()}
                </span>
                {isToday && <div className="w-1 h-1 rounded-full bg-main-green" />}
              </div>

              {/* Log Indicator - Stacked Thumbnails or Markers based on Tab */}
              <div className="mt-auto mb-1 lg:mb-2 flex flex-col items-stretch w-full min-h-[24px] lg:min-h-[40px]">
                {tab === 'petlog' && (
                  hasLogs ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative flex items-center justify-center h-6 lg:h-10">
                        {logs.slice(0, 3).reverse().map((log, idx, arr) => (
                          <div 
                            key={log.id} 
                            className="relative w-6 h-6 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-background shadow-sm ring-1 ring-main-green/20"
                            style={{
                              marginLeft: idx === 0 ? 0 : '-12px',
                              zIndex: idx
                            }}
                          >
                            <Image
                              src={getImagePath(log.representativePhotoPath)}
                              alt="Log"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {logs.length > 3 && (
                          <div className="absolute -right-2 -top-1 bg-main-green text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-background z-10">
                            +{logs.length - 3}
                          </div>
                        )}
                      </div>
                      {/* Count Dots for all logs */}
                      <div className="flex gap-0.5 mt-1">
                        {logs.map((log) => (
                          <div key={log.id} className="w-1 h-1 rounded-full bg-main-green/60" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-6 lg:h-10 w-1 bg-transparent" />
                  )
                )}

                {tab === 'care' && (() => {
                  const offset = day.date.getTimezoneOffset();
                  const localDate = new Date(day.date.getTime() - offset * 60 * 1000);
                  const dateStr = localDate.toISOString().split('T')[0];
                  const dayCares = careRecords.filter(r => r.recordDate === dateStr);
                  if (dayCares.length > 0) {
                    const displayCount = 2;
                    return (
                      <div className="flex flex-col gap-1 w-full px-1">
                        {/* Desktop View: Styled Pills with Icons and Titles */}
                        <div className="hidden lg:flex flex-col gap-1.5 w-full">
                          {dayCares.slice(0, displayCount).map((care) => {
                            const meta = getRecordTypeMeta(care);
                            return (
                              <div 
                                key={care.id} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border truncate w-full transition-all hover:brightness-95 ${meta.bg}`}
                                title={care.title}
                              >
                                <span className="shrink-0 text-[11px]">{meta.icon}</span>
                                <span className="truncate">{care.title || meta.label}</span>
                              </div>
                            );
                          })}
                          {dayCares.length > displayCount && (
                            <span className="text-[9px] font-black text-text-sub/80 pl-1.5">
                              +{dayCares.length - displayCount}개 더보기
                            </span>
                          )}
                        </div>

                        {/* Mobile View: Small colored circle badges with emoji */}
                        <div className="flex lg:hidden flex-wrap justify-center gap-0.5 max-w-full">
                          {dayCares.slice(0, 3).map((care) => {
                            const meta = getRecordTypeMeta(care);
                            return (
                              <span 
                                key={care.id} 
                                className={`w-5 h-5 flex items-center justify-center rounded-full border text-[11px] shrink-0 ${meta.bg}`} 
                                title={care.title}
                              >
                                {meta.icon}
                              </span>
                            );
                          })}
                          {dayCares.length > 3 && (
                            <span className="text-[8px] font-black text-text-sub flex items-center pl-0.5">
                              +{dayCares.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return <div className="h-6 lg:h-10 w-1 bg-transparent" />;
                })()}

                {tab === 'schedule' && (() => {
                  const offset = day.date.getTimezoneOffset();
                  const localDate = new Date(day.date.getTime() - offset * 60 * 1000);
                  const dateStr = localDate.toISOString().split('T')[0];
                  const daySchedules = schedules.filter(s => s.scheduleDate.startsWith(dateStr));
                  if (daySchedules.length > 0) {
                    const displayCount = 2;
                    return (
                      <div className="flex flex-col gap-1 w-full px-1">
                        {/* Desktop View: Styled Pills with Icons and Titles */}
                        <div className="hidden lg:flex flex-col gap-1.5 w-full">
                          {daySchedules.slice(0, displayCount).map((sch) => {
                            const meta = getScheduleTypeMeta(sch);
                            return (
                              <div 
                                key={sch.id} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border truncate w-full transition-all hover:brightness-95 ${meta.bg}`}
                                title={sch.title}
                              >
                                <span className="shrink-0 text-[11px]">{meta.icon}</span>
                                <span className="truncate">{sch.title || meta.label}</span>
                              </div>
                            );
                          })}
                          {daySchedules.length > displayCount && (
                            <span className="text-[9px] font-black text-text-sub/80 pl-1.5">
                              +{daySchedules.length - displayCount}개 더보기
                            </span>
                          )}
                        </div>

                        {/* Mobile View: Small colored circle badges with emoji */}
                        <div className="flex lg:hidden flex-wrap justify-center gap-0.5 max-w-full">
                          {daySchedules.slice(0, 3).map((sch) => {
                            const meta = getScheduleTypeMeta(sch);
                            return (
                              <span 
                                key={sch.id} 
                                className={`w-5 h-5 flex items-center justify-center rounded-full border text-[11px] shrink-0 ${meta.bg}`} 
                                title={sch.title}
                              >
                                {meta.icon}
                              </span>
                            );
                          })}
                          {daySchedules.length > 3 && (
                            <span className="text-[8px] font-black text-text-sub flex items-center pl-0.5">
                              +{daySchedules.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return <div className="h-6 lg:h-10 w-1 bg-transparent" />;
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
