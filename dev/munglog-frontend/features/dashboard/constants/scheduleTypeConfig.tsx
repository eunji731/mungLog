import { Stethoscope, Scissors, Shield, Activity, Pill, CalendarCheck } from 'lucide-react';
import type React from 'react';

export interface ScheduleTypeConfig {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
}

export const SCHEDULE_TYPE_CONFIG: Record<string, ScheduleTypeConfig> = {
  HOSPITAL:    { icon: Stethoscope,   color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/10',        label: '병원' },
  GROOMING:    { icon: Scissors,      color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/10',  label: '미용' },
  VACCINATION: { icon: Shield,        color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/10',      label: '예방접종' },
  CHECKUP:     { icon: Activity,      color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10',label: '건강검진' },
  MEDICINE:    { icon: Pill,          color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/10',  label: '투약' },
  ETC:         { icon: CalendarCheck, color: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-white/10',        label: '기타' },
};

export const EXPENSE_CAT_COLORS: Record<string, string> = {
  HOSPITAL: '#ef4444',
  MEDICINE: '#f97316',
  GROOMING: '#8b5cf6',
  FOOD:     '#22c55e',
  SUPPLIES: '#3b82f6',
  ETC:      '#94a3b8',
};
