'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: { value: string | number; label: string }[];
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find the selected option's label
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
          onClick={() => setIsOpen(!isOpen)}
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
          <span className={!selectedOption ? 'text-text-sub/50' : 'text-foreground font-semibold'}>
            {displayLabel}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-sub transition-transform duration-300 shrink-0 ${
              isOpen ? 'rotate-180 text-main-green' : 'group-hover:text-main-green'
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 z-[250] bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden p-1.5 animate-in zoom-in-95 duration-200 origin-top">
            <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-0.5">
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-left transition-all text-[14px] font-bold ${
                      isSelected
                        ? 'bg-main-green text-white font-black'
                        : 'hover:bg-surface-green/45 text-text-main hover:text-main-green hover:translate-x-1'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 ml-1 font-bold">{error}</p>}
    </div>
  );
};

