import React from 'react';

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, description, children, rightElement, className = '' }) => {
  return (
    <section className={`bg-white rounded-[32px] border border-[#F0F0F0] shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden ${className}`}>
      {(title || rightElement) && (
        <div className="px-8 py-6 border-b border-[#F5F5F5] flex items-center justify-between bg-white">
          <div>
            {title && <h3 className="text-[18px] font-black text-[#2D2D2D] tracking-tight leading-tight">{title}</h3>}
            {description && <p className="text-[12px] text-stone-400 mt-1 font-medium">{description}</p>}
          </div>
          {rightElement}
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
    </section>
  );
};
