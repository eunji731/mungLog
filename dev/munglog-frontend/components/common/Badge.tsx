import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'amber' | 'stone' | 'red' | 'orange' | 'emerald';
  className?: string;
}

export const Badge = ({ children, color = 'stone', className = '' }: BadgeProps) => {
  const colors = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    stone: "bg-stone-100 text-stone-500 border-stone-200/50",
    red: "bg-red-50 text-red-500 border-red-100",
    orange: "bg-[#FF6B00]/5 text-[#FF6B00] border-[#FF6B00]/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};
