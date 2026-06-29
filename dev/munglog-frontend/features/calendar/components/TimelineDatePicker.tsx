'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronUp, ChevronDown, X } from 'lucide-react';

interface TimelineDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label: string;
  variant?: 'button' | 'form';
  align?: 'top' | 'bottom';
}

type PickerMode = 'day' | 'yearMonth';

export default function TimelineDatePicker({ value, onChange, label, variant = 'button', align = 'bottom' }: TimelineDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setPickerMode] = useState<PickerMode>('day');
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const mobileYearListRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; bottom: number; right: number; width: number; height: number } | null>(null);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const years = Array.from({ length: 31 }, (_, i) => 2010 + i); // 2010 to 2040
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const scrollYears = (direction: 'up' | 'down', isMobile: boolean = false) => {
    const ref = isMobile ? mobileYearListRef : yearListRef;
    if (ref.current) {
      const scrollAmount = 120;
      ref.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (window.innerWidth >= 1024) {
        const insideTrigger = containerRef.current && containerRef.current.contains(target);
        const insidePicker = pickerRef.current && pickerRef.current.contains(target);
        if (!insideTrigger && !insidePicker) {
          setIsOpen(false);
          setPickerMode('day');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    } else {
      setCoords(null);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'yearMonth' && isOpen) {
      const timer = setTimeout(() => {
        const scrollToSelected = (ref: React.RefObject<HTMLDivElement | null>) => {
          if (ref.current) {
            const selectedBtn = ref.current.querySelector('[data-selected="true"]');
            if (selectedBtn) {
              selectedBtn.scrollIntoView({ block: 'center' });
            }
          }
        };
        scrollToSelected(yearListRef);
        scrollToSelected(mobileYearListRef);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode, isOpen]);

  const generateDays = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), current: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), current: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), current: false });
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    onChange(date.toLocaleDateString('en-CA'));
    setIsOpen(false);
    setPickerMode('day');
  };

  const displayDate = value ? new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }) : '날짜 선택';

  const renderPickerMain = (isMobile: boolean) => (
    <div className="w-full">
      {mode === 'day' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setPickerMode('yearMonth')}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-main-green/5 transition-colors"
            >
              <span className="text-sm font-black text-text-main group-hover:text-main-green">{year}년 {month + 1}월</span>
              <ChevronDown className="w-3 h-3 text-text-sub group-hover:text-main-green" />
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-surface-green rounded-lg text-text-sub">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-surface-green rounded-lg text-text-sub">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <div key={d} className={`text-center text-[10px] font-black py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-text-sub/40'}`}>
                {d}
              </div>
            ))}
            {generateDays().map((day, i) => {
              const dateStr = day.date.toLocaleDateString('en-CA');
              const isSelected = value === dateStr;
              const isToday = new Date().toLocaleDateString('en-CA') === dateStr;

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(day.date)}
                  className={`aspect-square rounded-xl text-[11px] font-bold flex items-center justify-center transition-all ${
                    day.current ? 'text-text-main' : 'text-text-sub/20'
                  } ${isSelected ? 'bg-main-green text-white shadow-lg shadow-main-green/30' : 'hover:bg-main-green/10'} ${
                    isToday && !isSelected ? 'text-main-green ring-2 ring-main-green/20' : ''
                  }`}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center px-1">
             <button onClick={() => { onChange(''); setIsOpen(false); }} className="text-[10px] font-black text-text-sub/60 hover:text-red-500">초기화</button>
             <button onClick={() => handleDateSelect(new Date())} className="text-[10px] font-black text-main-green hover:underline">오늘로 이동</button>
          </div>
        </div>
      ) : (
        <div className="flex h-[300px]">
          <div className="flex flex-col border-r border-border pr-3">
            <span className="text-[9px] font-black text-text-sub/40 tracking-widest uppercase px-3 mb-1 shrink-0">Year</span>
            <div className="relative flex-1 flex flex-col min-h-0 items-center">
              <button onClick={(e) => { e.stopPropagation(); scrollYears('up', isMobile); }} className="w-full flex justify-center py-1 text-text-sub hover:text-main-yellow"><ChevronUp className="w-5 h-5" /></button>
              <div ref={isMobile ? mobileYearListRef : yearListRef} className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar min-w-[80px] py-1 scroll-smooth">
                {years.map(y => (
                  <button
                    key={y}
                    data-selected={y === year}
                    onClick={() => setViewDate(new Date(y, month, 1))}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${y === year ? 'bg-main-yellow text-white shadow-md shadow-main-yellow/20' : 'text-text-main hover:bg-main-yellow/10'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              <button onClick={(e) => { e.stopPropagation(); scrollYears('down', isMobile); }} className="w-full flex justify-center py-1 text-text-sub hover:text-main-yellow"><ChevronDown className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex flex-col pl-4 flex-1">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-[9px] font-black text-text-sub/40 tracking-widest uppercase px-1">Month</span>
              <button onClick={() => setPickerMode('day')} className="p-1 hover:bg-surface-green rounded-full"><ChevronUp className="w-3.5 h-3.5 text-text-sub" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 pb-2 no-scrollbar">
              {months.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => { setViewDate(new Date(year, idx, 1)); setPickerMode('day'); }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${idx === month ? 'bg-main-green text-white shadow-md shadow-main-green/20' : 'text-text-main border border-border/50 hover:bg-main-green/10'}`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTrigger = () => {
    if (variant === 'form') {
      return (
        <div className="w-full space-y-2 text-left">
          <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">
            {label}
          </label>
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                updateCoords();
              }
              setIsOpen(!isOpen);
            }}
            className={`w-full px-5 py-3.5 rounded-xl border transition-all flex items-center justify-between shadow-sm bg-background ${
              isOpen
                ? 'border-main-green ring-4 ring-main-green/5'
                : 'border-border hover:border-main-green/30'
            }`}
          >
            <span className="text-[15px] font-medium text-foreground">
              {value ? displayDate : '날짜 선택'}
            </span>
            <CalendarIcon className={`w-5 h-5 ${isOpen ? 'text-main-green' : 'text-text-sub'}`} />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            updateCoords();
          }
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
          isOpen ? 'border-main-green bg-main-green/5 ring-4 ring-main-green/10' : 'border-border bg-background hover:border-main-green/30'
        }`}
      >
        <CalendarIcon className={`w-3.5 h-3.5 ${isOpen ? 'text-main-green' : 'text-text-sub'}`} />
        <span className={`text-[11px] lg:text-xs font-black ${isOpen ? 'text-main-green' : 'text-text-main'}`}>
          {value ? displayDate : label}
        </span>
      </button>
    );
  };

  const getDesktopStyle = (): React.CSSProperties => {
    if (!coords) return { display: 'none' };
    const style: React.CSSProperties = {
      position: 'fixed',
      width: '300px',
    };

    // Auto-detect best vertical alignment if space is tight
    const pickerHeight = 350; // Approximate maximum height of the picker
    const spaceBelow = window.innerHeight - coords.bottom;
    const spaceAbove = coords.top;

    let finalAlign = align;
    if (align === 'bottom' && spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
      finalAlign = 'top';
    } else if (align === 'top' && spaceAbove < pickerHeight && spaceBelow > spaceAbove) {
      finalAlign = 'bottom';
    }

    // Vertical positioning
    if (finalAlign === 'top') {
      style.bottom = `${window.innerHeight - coords.top + 8}px`;
      style.transformOrigin = 'bottom';
    } else {
      style.top = `${coords.bottom + 8}px`;
      style.transformOrigin = 'top';
    }

    // Horizontal positioning
    if (variant === 'form') {
      style.left = `${coords.right - 300}px`;
    } else {
      style.left = `${coords.left}px`;
    }

    return style;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {renderTrigger()}

      {isOpen && (
        <>
          {/* MOBILE VERSION: Rendered via Portal to escape sticky/blur constraints */}
          {mounted && createPortal(
            <div className="lg:hidden fixed inset-0 z-[1000] flex flex-col items-center justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsOpen(false); setPickerMode('day'); }} />
              <div className="relative w-full bg-background rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
                <div className="p-6 flex items-center justify-between border-b border-border shrink-0">
                  <h3 className="text-lg font-black text-text-main">{label}</h3>
                  <button onClick={() => { setIsOpen(false); setPickerMode('day'); }} className="p-2 bg-background rounded-full active:scale-90 transition-transform">
                    <X className="w-5 h-5 text-text-main" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-background p-4 pb-12 min-h-[400px]">
                  {renderPickerMain(true)}
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* DESKTOP VERSION: Rendered via Portal to avoid overflow clipping */}
          {mounted && coords && createPortal(
            <div
              ref={pickerRef}
              className="hidden lg:block fixed z-[1000] bg-background rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border p-4 w-[300px] animate-in zoom-in-95 duration-200"
              style={getDesktopStyle()}
            >
              {renderPickerMain(false)}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
