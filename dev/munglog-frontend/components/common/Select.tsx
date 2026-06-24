import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="text-[13px] font-black text-stone-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          className={`
            w-full px-5 py-3.5 rounded-xl border transition-all duration-300 outline-none
            bg-white text-[15px] font-medium appearance-none cursor-pointer
            ${error 
              ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50' 
              : 'border-stone-100 focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 shadow-sm'}
            text-[#2D2D2D]
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 font-bold group-hover:text-[#FF6B00] transition-colors">
          ▼
        </span>
      </div>
      {error && <p className="text-[11px] text-red-500 ml-1 font-bold">{error}</p>}
    </div>
  );
};
