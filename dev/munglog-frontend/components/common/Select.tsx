'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { getImagePath } from '@/lib/clientApi';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: { 
    value: string | number; 
    label: string; 
    photo?: string; 
    photoType?: 'profiles' | 'daily';
    subLabel?: string;
  }[];
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  value,
  onChange,
  disabled,
  placeholder,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; bottom: number; right: number; width: number; height: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate coordinates on window resize or scroll
  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Find the selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || '선택해주세요');

  const handleSelect = (val: string | number) => {
    if (disabled) return;
    setIsOpen(false);

    if (onChange) {
      const event = {
        target: {
          value: String(val),
          name: props.name || '',
        },
        currentTarget: {
          value: String(val),
          name: props.name || '',
        }
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(event);
    }
  };

  const getDropdownStyle = (): React.CSSProperties => {
    if (!coords) return { display: 'none' };

    const dropdownHeight = 240; // Max height approximately
    const spaceBelow = window.innerHeight - coords.bottom;
    const spaceAbove = coords.top;

    let position: 'top' | 'bottom' = 'bottom';
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow && spaceAbove > dropdownHeight + 16) {
      position = 'top';
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      width: `${coords.width}px`,
      left: `${coords.left}px`,
      zIndex: 9999,
    };

    if (position === 'top') {
      let bottomY = window.innerHeight - coords.top + 4;
      const computedTop = window.innerHeight - bottomY - dropdownHeight;
      if (computedTop < 16) {
        bottomY = window.innerHeight - 16 - dropdownHeight;
      }
      style.bottom = `${bottomY}px`;
      style.transformOrigin = 'bottom';
    } else {
      let topY = coords.bottom + 4;
      if (topY + dropdownHeight > window.innerHeight - 16) {
        topY = window.innerHeight - 16 - dropdownHeight;
      }
      if (topY < 16) {
        topY = 16;
      }
      style.top = `${topY}px`;
      style.transformOrigin = 'top';
    }

    return style;
  };

  return (
    <div ref={containerRef} className="w-full space-y-2 text-left relative">
      {label && (
        <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!isOpen) updateCoords();
            setIsOpen(!isOpen);
          }}
          className={`
            w-full px-5 py-3.5 rounded-xl border transition-all duration-300 outline-none
            bg-background text-[15px] font-medium flex items-center justify-between cursor-pointer shadow-sm
            ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''}
            ${isOpen
              ? 'border-main-green ring-4 ring-main-green/5'
              : error
                ? 'border-red-300 focus:border-red-500 ring-4 ring-red-500/10'
                : 'border-border hover:border-main-green/30'}
            text-foreground
            ${className}
          `}
        >
          {selectedOption && (selectedOption.photo !== undefined || selectedOption.photo === '') ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-green border border-border flex items-center justify-center shrink-0 shadow-sm">
                {selectedOption.photo ? (
                  <img src={getImagePath(selectedOption.photo, selectedOption.photoType || 'profiles')} alt={selectedOption.label} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px]">🐶</span>
                )}
              </div>
              <span className="text-xs font-black text-foreground">
                {selectedOption.label}
              </span>
            </div>
          ) : !selectedOption && (placeholder === '아이 선택' || label === '아이 선택') ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-surface-green border border-border flex items-center justify-center shrink-0 text-text-sub shadow-sm">
                <span className="text-[11px]">🐾</span>
              </div>
              <span className="text-xs font-bold text-text-sub/50">
                아이 선택
              </span>
            </div>
          ) : (
            <span className={!selectedOption ? 'text-text-sub/50' : 'text-foreground font-semibold'}>
              {displayLabel}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-text-sub transition-transform duration-300 shrink-0 ${
              isOpen ? 'rotate-180 text-main-green' : 'group-hover:text-main-green'
            }`}
          />
        </button>

        {isOpen && !disabled && mounted && coords && createPortal(
          <div
            ref={dropdownRef}
            className="fixed bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden p-1.5 animate-in zoom-in-95 duration-200"
            style={getDropdownStyle()}
          >
            <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-0.5">
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const hasPhoto = opt.photo !== undefined;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-main-green text-white font-black'
                        : 'hover:bg-surface-green/45 text-text-main hover:text-main-green hover:translate-x-1'
                    }`}
                  >
                    {hasPhoto ? (
                      <>
                        <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${
                          isSelected ? 'border-white/30 bg-white/20' : 'border-border bg-surface-green'
                        }`}>
                          {opt.photo ? (
                            <img src={getImagePath(opt.photo, opt.photoType || 'profiles')} alt={opt.label} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[14px]">🐶</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold leading-tight">{opt.label}</span>
                          {opt.subLabel && (
                            <span className={`text-[10px] leading-tight ${isSelected ? 'text-white/70' : 'text-text-sub/70'}`}>
                              {opt.subLabel}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-[14px] font-bold">{opt.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 ml-1 font-bold">{error}</p>}
    </div>
  );
};
