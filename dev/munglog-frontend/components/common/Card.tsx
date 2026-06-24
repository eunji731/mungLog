import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-background rounded-2xl border border-border shadow-[0_10px_40px_rgba(0,0,0,0.02)] transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-main-green/30 hover:shadow-[0_15px_50px_rgba(125,190,122,0.08)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
