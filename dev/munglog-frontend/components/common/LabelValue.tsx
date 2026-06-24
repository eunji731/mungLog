import React from 'react';

interface LabelValueProps {
  label: string;
  value?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  border?: boolean;
}

export const LabelValue: React.FC<LabelValueProps> = ({ label, value, children, className = '', border = true }) => {
  return (
    <div className={`py-4 flex flex-col sm:flex-row sm:items-center gap-2 ${border ? 'border-b border-orange-50 last:border-0' : ''} ${className}`}>
      <dt className="sm:w-32 text-[12px] font-extrabold text-stone-400 flex-shrink-0">
        {label}
      </dt>
      <dd className="flex-grow text-stone-800 text-[14px] font-bold">
        {children || value || <span className="text-stone-300 font-medium italic">정보 없음</span>}
      </dd>
    </div>
  );
};
