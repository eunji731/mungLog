import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'green' | 'yellow';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'green', className = '' }) => {
  const sizeClass = {
    sm: 'w-8 h-8 border-4',
    md: 'w-10 h-10 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-24 h-24 border-4',
  }[size];

  const colorClass = color === 'yellow'
    ? 'border-border border-t-main-yellow'
    : 'border-border border-t-main-green';

  return <div className={`rounded-full animate-spin ${sizeClass} ${colorClass} ${className}`} />;
};
