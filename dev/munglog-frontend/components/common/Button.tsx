import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const base = "inline-flex items-center justify-center font-bold transition-all duration-300 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-[#FF6B00] text-white shadow-[0_4px_20px_rgba(255,107,0,0.15)] hover:bg-[#E66000] hover:shadow-[0_6px_25px_rgba(255,107,0,0.25)]",
    outline: "border-2 border-[#EEEEEE] text-[#2D2D2D] bg-white hover:border-[#FF6B00] hover:text-[#FF6B00]",
    ghost: "text-stone-400 hover:text-[#2D2D2D] hover:bg-stone-50"
  };

  const sizes = {
    sm: "px-4 py-2 text-[13px] rounded-lg",
    md: "px-6 py-3 text-[14px] rounded-xl",
    lg: "px-8 py-4 text-[15px] rounded-2xl" // 메인 버튼만 더 둥근 느낌 유지
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
