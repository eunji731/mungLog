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
      className={`bg-white rounded-2xl border border-[#F0F0F0] shadow-[0_10px_40px_rgba(0,0,0,0.02)] transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-[#FF6B00]/20 hover:shadow-[0_15px_50px_rgba(0,0,0,0.04)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
