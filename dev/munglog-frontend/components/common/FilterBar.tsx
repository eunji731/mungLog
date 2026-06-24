import React from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  rightElement?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  options, 
  selectedValue, 
  onSelect,
  rightElement 
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-2">
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100/50 rounded-[18px] w-full md:w-auto overflow-x-auto no-scrollbar">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-[14px] text-[13px] font-black tracking-tight transition-all duration-300 ${
              selectedValue === option.value
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20 active:scale-95'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200/50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {rightElement && (
        <div className="w-full md:w-auto flex justify-end">
          {rightElement}
        </div>
      )}
    </div>
  );
};
