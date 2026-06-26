'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DateDropdown from '@/app/calendar/components/DateDropdown';
import { useDash } from '../context/DashboardContext';

export default function MonthNavigator() {
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
