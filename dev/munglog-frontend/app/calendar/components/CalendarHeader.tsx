'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, LayoutGrid, List } from 'lucide-react';
import DateDropdown from './DateDropdown';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onGoToDate: (year: number, month: number) => void;
  onRecord: () => void;
  isTimelineMode: boolean;
  onToggleView: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function CalendarHeader({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday,
  onGoToDate,
  onRecord,
  isTimelineMode,
  onToggleView,
  activeTab = 'petlog',
  onTabChange
}: CalendarHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.toLocaleString('ko-KR', { month: 'long' });

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-6 py-3.5 shrink-0 gap-4">
      {/* Left: Navigation, Today, Divider, Tab Chips (All styled with rounded-xl chips!) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 lg:gap-6 flex-1">
        {/* Navigation Control (Plain design, no capsule border) */}
        <div className="flex items-center gap-0.5 lg:gap-2">
          <button 
            onClick={onPrevMonth} 
            className="p-1.5 hover:bg-main-yellow/10 rounded-xl transition-all text-text-sub hover:text-main-yellow active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-1 lg:px-4 py-2 rounded-2xl transition-all group active:scale-95 ${
                isDropdownOpen ? 'bg-main-yellow/10 text-main-yellow' : 'hover:bg-main-yellow/5'
              }`}
            >
              <span className={`text-base lg:text-lg font-extrabold tracking-tight min-w-[90px] lg:min-w-[140px] text-center text-text-main group-hover:text-main-yellow transition-colors`}>
                {year}년 {month}
              </span>
            </button>
 
            {isDropdownOpen && (
              <DateDropdown 
                currentDate={currentDate}
                onSelect={(y, m) => {
                  onGoToDate(y, m);
                  setIsDropdownOpen(false);
                }}
                onClose={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
          
          <button 
            onClick={onNextMonth} 
            className="p-1.5 hover:bg-main-yellow/10 rounded-xl transition-all text-text-sub hover:text-main-yellow active:scale-90"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* Premium Today Button */}
        <button 
          onClick={onToday}
          className="shrink-0 px-4 py-1.5 bg-main-yellow/10 border border-main-yellow/20 rounded-xl text-xs font-black text-main-yellow hover:bg-main-yellow hover:text-white transition-all shadow-sm hover:shadow-main-yellow/10 active:scale-95"
        >
          오늘
        </button>

        {/* Divider (Desktop Only) */}
        {onTabChange && (
          <span className="hidden md:block w-px h-5 bg-border self-center" />
        )}

        {/* Unified Tab Chips styled exactly like the Today button */}
        {onTabChange && (
          <div className="flex items-center gap-2">
            {[
              { id: 'petlog', label: '📖 일기' },
              { id: 'care', label: '🩺 케어' },
              { id: 'schedule', label: '📅 일정' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs transition-all active:scale-95 border ${
                    isActive
                      ? 'bg-main-green text-white border-main-green font-black shadow-sm shadow-main-green/10'
                      : 'bg-background text-text-sub border-border hover:bg-main-green/5 hover:text-main-green font-bold'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Record & Toggle View */}
      <div className="flex items-center justify-end gap-2.5 shrink-0">
        {activeTab === 'petlog' && (
          <button 
            onClick={onToggleView}
            className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${
              isTimelineMode 
                ? 'bg-main-green text-white shadow-md' 
                : 'bg-background border border-border text-text-main hover:bg-main-green/5'
            }`}
          >
            {isTimelineMode ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            <span>{isTimelineMode ? '달력보기' : '모아보기'}</span>
          </button>
        )}

        <button 
          onClick={onRecord}
          className="flex items-center gap-2 px-4 py-2 bg-main-yellow text-white font-black rounded-xl text-xs lg:text-sm shadow-md shadow-main-yellow/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> 
          <span>
            {activeTab === 'petlog' ? '일기 작성' : activeTab === 'care' ? '케어 기록' : '일정 등록'}
          </span>
        </button>
      </div>
    </div>
  );
}
