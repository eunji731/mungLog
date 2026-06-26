'use client';

import { useState, useEffect, useCallback } from 'react';
import { careApi } from '@/api/careApi';
import { scheduleApi } from '@/api/scheduleApi';
import { useInventoryStore } from '@/app/common/hooks/useInventory';
import { usePetStore, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import type { CareRecord } from '@/types/care';
import type { Schedule, ScheduleStreak } from '@/types/schedule';

export interface MonthlyExpensePoint {
  month: string;
  total: number;
}

export interface ExpenseCategoryStat {
  code: string;
  label: string;
  total: number;
}

export interface ScheduleTypeStat {
  type: string;
  count: number;
}

const EXPENSE_CAT_LABELS: Record<string, string> = {
  HOSPITAL: '병원비',
  MEDICINE: '약/영양제',
  GROOMING: '미용',
  FOOD:     '사료/간식',
  SUPPLIES: '용품',
  ETC:      '기타',
};

function categorizeRecord(r: CareRecord): string {
  if (r.recordType === 'EXPENSE') return r.categoryCode || 'ETC';
  if (r.recordType === 'HOSPITAL' || r.recordType === 'CHECKUP' || r.recordType === 'VACCINATION') return 'HOSPITAL';
  if (r.recordType === 'MEDICINE') return 'MEDICINE';
  if (r.recordType === 'GROOMING') return 'GROOMING';
  return 'ETC';
}

export function useDashboardExtra(selectedYear?: number, selectedMonth?: number) {
  const { selectedPetId } = usePetStore();
  const petId = selectedPetId === ALL_PETS_ID ? undefined : (selectedPetId ?? undefined);

  const { items: inventoryItems, fetchItems } = useInventoryStore();

  const [careRecords, setCareRecords] = useState<CareRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [streaks, setStreaks] = useState<ScheduleStreak[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [care, sched, streak] = await Promise.all([
        careApi.getRecords({ petId }),
        scheduleApi.getSchedules({ petId }),
        scheduleApi.getStreaks(petId),
      ]);
      setCareRecords(care);
      setSchedules(sched);
      setStreaks(streak);
    } catch (e) {
      console.error('대시보드 추가 데이터 로드 실패:', e);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchAll();
    fetchItems();
  }, [fetchAll, fetchItems]);

  const activeMedications = careRecords.filter(r => r.medicationStatus === 'ACTIVE');

  const upcomingSchedules = schedules
    .filter(s => !s.isCompleted && s.dDay >= 0)
    .sort((a, b) => a.dDay - b.dDay)
    .slice(0, 5);

  const now = new Date();
  const targetYear = selectedYear ?? now.getFullYear();
  const targetMonth = selectedMonth ?? (now.getMonth() + 1);
  const monthPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  const monthSchedules = schedules.filter(s => s.scheduleDate.startsWith(monthPrefix));
  const completedCount = monthSchedules.filter(s => s.isCompleted).length;

  const completedTypeMap: Record<string, number> = {};
  const pendingTypeMap: Record<string, number> = {};
  for (const s of monthSchedules) {
    const type = String(s.scheduleTypeCode || 'ETC');
    if (s.isCompleted) {
      completedTypeMap[type] = (completedTypeMap[type] || 0) + 1;
    } else {
      pendingTypeMap[type] = (pendingTypeMap[type] || 0) + 1;
    }
  }

  const monthScheduleTypeStats: ScheduleTypeStat[] = Object.entries(
    monthSchedules.reduce((acc, s) => {
      const type = String(s.scheduleTypeCode || 'ETC');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

  const pendingTypeStats: ScheduleTypeStat[] = Object.entries(pendingTypeMap)
    .map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
  const completedTypeStats: ScheduleTypeStat[] = Object.entries(completedTypeMap)
    .map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

  const monthlyExpense: MonthlyExpensePoint[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: `${d.getMonth() + 1}월`,
      total: careRecords
        .filter(r => r.recordDate?.startsWith(key) && r.amount && r.amount > 0)
        .reduce((sum, r) => sum + (r.amount ?? 0), 0),
    };
  });

  const catTotals: Record<string, number> = {};
  for (const r of careRecords) {
    if (!r.amount || r.amount <= 0) continue;
    const cat = categorizeRecord(r);
    catTotals[cat] = (catTotals[cat] || 0) + r.amount;
  }
  const expenseCategoryStats: ExpenseCategoryStat[] = Object.entries(catTotals)
    .map(([code, total]) => ({ code, label: EXPENSE_CAT_LABELS[code] ?? code, total }))
    .sort((a, b) => b.total - a.total);

  const lowStockItems = inventoryItems.filter(i => i.stock <= 2 && i.stock >= 0);

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const expiringItems = inventoryItems.filter(i => {
    if (!i.expiryDateSpecific) return false;
    const expiry = new Date(i.expiryDateSpecific);
    return expiry >= now && expiry <= sevenDaysLater;
  });

  const feedingItems = inventoryItems.filter(i => i.isFeeding);

  return {
    loading,
    careRecords,
    activeMedications,
    upcomingSchedules,
    monthSchedules,
    completedCount,
    monthScheduleTypeStats,
    pendingTypeStats,
    completedTypeStats,
    streaks,
    monthlyExpense,
    expenseCategoryStats,
    lowStockItems,
    expiringItems,
    feedingItems,
  };
}
