import React from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  label?: string;
  variant?: 'form' | 'compact';
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  selected, 
  onChange, 
  placeholderText = "날짜 선택",
  className = "",
  label,
  variant = 'compact'
}) => {
  if (variant === 'form') {
    return (
      <div className={`w-full space-y-2 text-left ${className}`}>
        {label && (
          <label className="text-[13px] font-black text-stone-400 uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <div className="w-full px-5 py-3.5 rounded-xl border border-stone-100 focus-within:border-[#FF6B00] focus-within:ring-4 focus-within:ring-[#FF6B00]/5 shadow-sm bg-white transition-all duration-300">
          <ReactDatePicker
            selected={selected}
            onChange={onChange}
            locale={ko}
            dateFormat="yyyy-MM-dd"
            placeholderText={placeholderText}
            className="w-full bg-transparent border-none outline-none text-[15px] font-medium text-[#2D2D2D] cursor-pointer placeholder:text-stone-300"
            portalId="root-portal"
            popperPlacement="bottom-start"
            fixedHeight
            autoComplete="off"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`custom-datepicker-container ${className}`}>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        locale={ko}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholderText}
        className="w-full bg-transparent border-none outline-none text-[14px] font-black text-[#2D2D2D] cursor-pointer"
        portalId="root-portal"
        popperPlacement="bottom-start"
        fixedHeight
        autoComplete="off"
      />
    </div>
  );
};
