import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="text-[13px] font-black text-stone-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-5 py-3.5 rounded-xl border transition-all duration-300 outline-none
          bg-white text-[15px] font-medium
          ${error 
            ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50' 
            : 'border-stone-100 focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 shadow-sm'}
          text-[#2D2D2D] placeholder:text-stone-300
          ${className}
        `}
        {...props}
      />
      {error ? (
        <p className="text-[11px] text-red-500 ml-1 font-bold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stone-400 ml-1 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
};
