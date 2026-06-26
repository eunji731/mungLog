'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react';

interface TimelineTimePickerProps {
  value: string; // HH:mm
  onChange: (time: string) => void;
  label: string;
  variant?: 'button' | 'form';
}

export default function TimelineTimePicker({ value, onChange, label, variant = 'button' }: TimelineTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const mobileHourListRef = useRef<HTMLDivElement>(null);
  const mobileMinuteListRef = useRef<HTMLDivElement>(null);

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

  const currentHour = value ? parseInt(value.split(':')[0], 10) : 12;
  const currentMinute = value ? parseInt(value.split(':')[1], 10) : 0;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      const scrollAmount = 80;
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
    if (isOpen) {
      const timer = setTimeout(() => {
        const scrollToSelected = (ref: React.RefObject<HTMLDivElement | null>) => {
          if (ref.current) {
            const selectedBtn = ref.current.querySelector('[data-selected="true"]');
            if (selectedBtn) {
              selectedBtn.scrollIntoView({ block: 'center' });
            }
          }
        };
        scrollToSelected(hourListRef);
        scrollToSelected(minuteListRef);
        scrollToSelected(mobileHourListRef);
        scrollToSelected(mobileMinuteListRef);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentHour, currentMinute]);

  const handleTimeSelect = (h: number, m: number) => {
    const formattedHour = String(h).padStart(2, '0');
    const formattedMinute = String(m).padStart(2, '0');
    onChange(`${formattedHour}:${formattedMinute}`);
  };

  const getAmPmLabel = () => {
    if (!value) return '시간 선택';
    const h = currentHour;
    const m = String(currentMinute).padStart(2, '0');
    const ampm = h >= 12 ? '오후' : '오전';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${ampm} ${String(displayHour).padStart(2, '0')}:${m}`;
  };

  const renderPickerMain = (isMobile: boolean) => {
    const hRef = isMobile ? mobileHourListRef : hourListRef;
    const mRef = isMobile ? mobileMinuteListRef : minuteListRef;

    return (
      <div className="flex h-[240px] gap-4 bg-background p-1 select-none">
        {/* Hour Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <span className="text-[9px] font-black text-text-sub/40 tracking-widest uppercase text-center mb-1.5 shrink-0">Hour</span>
          <div className="relative flex-1 flex flex-col min-h-0 items-center border border-border/50 rounded-2xl p-1 bg-surface-green/10">
            <button type="button" onClick={() => scrollContainer(hRef, 'up')} className="w-full flex justify-center py-1 text-text-sub hover:text-main-yellow shrink-0">
              <ChevronUp className="w-4 h-4" />
            </button>
            <div ref={hRef} className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar w-full py-1 scroll-smooth">
              {hours.map(h => {
                const isSelected = currentHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleTimeSelect(h, currentMinute)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all flex justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-main-yellow text-white shadow-md shadow-main-yellow/20' 
                        : 'text-text-main hover:bg-main-yellow/10'
                    }`}
                  >
                    {String(h).padStart(2, '0')}시
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => scrollContainer(hRef, 'down')} className="w-full flex justify-center py-1 text-text-sub hover:text-main-yellow shrink-0">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minute Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <span className="text-[9px] font-black text-text-sub/40 tracking-widest uppercase text-center mb-1.5 shrink-0">Minute</span>
          <div className="relative flex-1 flex flex-col min-h-0 items-center border border-border/50 rounded-2xl p-1 bg-surface-green/10">
            <button type="button" onClick={() => scrollContainer(mRef, 'up')} className="w-full flex justify-center py-1 text-text-sub hover:text-main-green shrink-0">
              <ChevronUp className="w-4 h-4" />
            </button>
            <div ref={mRef} className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar w-full py-1 scroll-smooth">
              {minutes.map(m => {
                const isSelected = currentMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleTimeSelect(currentHour, m)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all flex justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-main-green text-white shadow-md shadow-main-green/20' 
                        : 'text-text-main hover:bg-main-green/10'
                    }`}
                  >
                    {String(m).padStart(2, '0')}분
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => scrollContainer(mRef, 'down')} className="w-full flex justify-center py-1 text-text-sub hover:text-main-green shrink-0">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              {getAmPmLabel()}
            </span>
            <Clock className={`w-5 h-5 ${isOpen ? 'text-main-green' : 'text-text-sub'}`} />
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
        <Clock className={`w-3.5 h-3.5 ${isOpen ? 'text-main-green' : 'text-text-sub'}`} />
        <span className={`text-[11px] lg:text-xs font-black ${isOpen ? 'text-main-green' : 'text-text-main'}`}>
          {value ? getAmPmLabel() : label}
        </span>
      </button>
    );
  };

  const getDesktopStyle = (): React.CSSProperties => {
    if (!coords) return { display: 'none' };
    const style: React.CSSProperties = {
      position: 'fixed',
      width: '280px',
    };

    // Vertical positioning (opens downward by default)
    style.top = `${coords.bottom + 8}px`;
    style.transformOrigin = 'top';

    // Horizontal positioning
    if (variant === 'form') {
      style.left = `${coords.right - 280}px`;
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
          {/* MOBILE VERSION: Bottom sheet via Portal */}
          {mounted && createPortal(
            <div className="lg:hidden fixed inset-0 z-[1000] flex flex-col items-center justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
              <div className="relative w-full bg-background rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
                <div className="p-6 flex items-center justify-between border-b border-border shrink-0">
                  <h3 className="text-lg font-black text-text-main">{label}</h3>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-2 bg-background rounded-full active:scale-90 transition-transform">
                    <X className="w-5 h-5 text-text-main" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-background p-4 pb-12 min-h-[300px]">
                  {renderPickerMain(true)}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full mt-6 py-3 bg-main-green hover:bg-main-green/90 text-white font-black rounded-xl text-sm transition-all"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* DESKTOP VERSION: Rendered via Portal to avoid overflow clipping */}
          {mounted && coords && createPortal(
            <div 
              ref={pickerRef}
              className="hidden lg:block fixed z-[1000] bg-background rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border p-4 w-[280px] animate-in zoom-in-95 duration-200"
              style={getDesktopStyle()}
            >
              {renderPickerMain(false)}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 py-2 bg-main-green hover:bg-main-green/90 text-white text-[11px] font-black rounded-xl transition-all"
              >
                확인
              </button>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
