import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'amber' | 'stone' | 'red' | 'orange' | 'emerald' | 'green' | 'yellow';
  className?: string;
}

export const Badge = ({ children, color = 'stone', className = '' }: BadgeProps) => {
  const colors = {
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    stone: "bg-stone-100 text-stone-500 border-stone-200/50 dark:bg-stone-850 dark:text-stone-400 dark:border-stone-700/50",
    red: "bg-red-50 text-red-500 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
    orange: "bg-light-green text-main-green border-main-green/20 dark:bg-light-green/10 dark:text-main-green/90 dark:border-main-green/30",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    green: "bg-light-green text-main-green border-main-green/20 dark:bg-light-green/10 dark:text-main-green/90 dark:border-main-green/30",
    yellow: "bg-light-yellow text-amber-600 border-main-yellow/20 dark:bg-light-yellow/10 dark:text-main-yellow/90 dark:border-main-yellow/30"
  };

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-black border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};
