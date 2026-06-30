'use client';

import React from 'react';
import type { VaccinationDDayInfo } from '@/types/vaccination';
import { formatDDay } from '@/utils/vaccinationDDay';

interface VaccinationDDayBadgeProps {
  dDayInfo: VaccinationDDayInfo | null;
  size?: 'sm' | 'xs';
}

const STATUS_CONFIG = {
  OK:      { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: '정상' },
  SOON:    { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   label: '임박' },
  OVERDUE: { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     label: '접종필요' },
};

const VaccinationDDayBadge: React.FC<VaccinationDDayBadgeProps> = ({ dDayInfo, size = 'sm' }) => {
  if (!dDayInfo) return null;

  const cfg = STATUS_CONFIG[dDayInfo.status];
  const isXs = size === 'xs';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} font-black shrink-0 ${isXs ? 'text-[9px]' : 'text-[10px]'}`}
    >
      {formatDDay(dDayInfo.dDay!)}
      <span className={`font-medium ${isXs ? 'text-[8px]' : 'text-[9px]'}`}>{cfg.label}</span>
    </span>
  );
};

export default VaccinationDDayBadge;
