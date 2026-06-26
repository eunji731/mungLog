'use client';

import { createContext, useContext } from 'react';
import type { useDashboard } from '../hooks/useDashboard';
import type { useDashboardExtra } from '../hooks/useDashboardExtra';

type DashboardCtxType = ReturnType<typeof useDashboard>;
type ExtraCtxType = ReturnType<typeof useDashboardExtra>;

export const DashboardCtx = createContext<DashboardCtxType | null>(null);
export const ExtraCtx = createContext<ExtraCtxType | null>(null);

export function useDash(): DashboardCtxType {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error('DashboardCtx not provided');
  return ctx;
}

export function useExtra(): ExtraCtxType {
  const ctx = useContext(ExtraCtx);
  if (!ctx) throw new Error('ExtraCtx not provided');
  return ctx;
}
