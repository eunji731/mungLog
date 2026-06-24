import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const base = "inline-flex items-center justify-center font-bold transition-all duration-300 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-main-green text-white shadow-[0_4px_20px_rgba(125,190,122,0.15)] hover:bg-deep-green dark:hover:bg-main-green/90 hover:shadow-[0_6px_25px_rgba(125,190,122,0.25)]",
    outline: "border-2 border-border text-foreground bg-background hover:border-main-green hover:text-main-green",
    ghost: "text-text-sub hover:text-foreground hover:bg-surface-green"
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
