'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePetStore, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { apiClient } from '@/lib/apiClient';

// 모멘트에 포함된 사진 정보
export interface Photo {
  id: string;
  path: string;
  takenAt?: string;
  lat?: number;
  lng?: number;
}

// 개별 사건 (Moment) 정보
export interface Moment {
  id: string;
  category: 'ACTIVITY' | 'GENERAL' | 'OBJECT' | 'HEALTH';
  eventTime?: string;
  locationName?: string;
  aiTitle: string;
  aiContent: string;
  energyLevel: number;
  photos: Photo[];
  tags: string[];
  dogIds: string[];
}

// 하루 총괄 일기 (Daily Log) 정보
export interface DailyLog {
  id: string;
  dateKey: string; // YYYY-MM-DD
  aiTitle: string;
  aiSummary: string;
  representativePhotoPath?: string;
  moments: Moment[];
}

interface DiaryState {
  dailyLogs: Record<string, DailyLog[]>;
  addDailyLog: (log: DailyLog) => void;
  removeDailyLog: (id: string, dateKey: string) => void;
  getDailyLogsForDate: (dateKey: string) => DailyLog[];
  setDailyLogs: (logs: Record<string, DailyLog[]>) => void;
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      addDailyLog: (log) => {
        set((state) => {
          const currentLogs = state.dailyLogs[log.dateKey] || [];
          // Prevent duplicates by ID
          const updatedLogs = currentLogs.filter(l => l.id !== log.id).concat(log);
          return {
            dailyLogs: { ...state.dailyLogs, [log.dateKey]: updatedLogs }
          };
        });
      },
      removeDailyLog: (id, dateKey) => {
        set((state) => {
          const currentLogs = state.dailyLogs[dateKey];
          if (!currentLogs) return state;
          const updatedLogs = currentLogs.filter(l => l.id !== id);
          const newDailyLogs = { ...state.dailyLogs };
          if (updatedLogs.length === 0) {
            delete newDailyLogs[dateKey];
          } else {
            newDailyLogs[dateKey] = updatedLogs;
          }
          return { dailyLogs: newDailyLogs };
        });
      },
      getDailyLogsForDate: (dateKey) => get().dailyLogs[dateKey] || [],
      setDailyLogs: (logs) => set({ dailyLogs: logs }),
    }),
    {
      name: 'diary-hierarchical-storage',
    }
  )
);

interface MemoryListItem {
  id: string;
  memoryDate: string;
}

interface MemoryMomentDetail {
  id: string;
  category: string;
  aiTitle: string;
  aiContent: string;
  locationName?: string;
  energyLevel?: string;
  tags: string[];
  photos: { id: string; path: string }[];
}

interface MemoryDetailItem {
  id: string;
  memoryDate: string;
  aiTitle: string;
  summary: string;
  location?: string;
  energyLevel?: string;
  representativePhotoPath?: string;
  petIds: string[];
  moments: MemoryMomentDetail[];
}

export const useDiary = () => {
  const { dailyLogs, addDailyLog, removeDailyLog, getDailyLogsForDate, setDailyLogs } = useDiaryStore();
  const { selectedPetId } = usePetStore();

  const allLogs = Object.values(dailyLogs).flat().sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const filteredLogs = selectedPetId === ALL_PETS_ID
    ? allLogs
    : allLogs.filter(log =>
        log.moments.some(moment => moment.dogIds.includes(selectedPetId || ''))
      );

  const syncFromBackend = async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const queryString = params
        ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => !!v) as string[][]).toString()}`
        : '';

      const listRes = await apiClient.get(`/memories${queryString}`);
      const memoryList: MemoryListItem[] = listRes.data ?? [];

      const details = await Promise.all(
        memoryList.map(async (item) => {
          try {
            const res = await apiClient.get(`/memories/${item.id}`);
            return res.data as MemoryDetailItem;
          } catch {
            return null;
          }
        })
      );

      const logs: Record<string, DailyLog[]> = {};
      for (const m of details) {
        if (!m) continue;

        const moments: Moment[] = m.moments.map(mo => ({
          id: mo.id,
          category: (mo.category as Moment['category']) || 'GENERAL',
          locationName: mo.locationName || '알 수 없는 곳',
          aiTitle: mo.aiTitle || '기록',
          aiContent: mo.aiContent || '',
          energyLevel: Number(mo.energyLevel) || 3,
          photos: mo.photos.map(p => ({ id: p.id, path: p.path })),
          tags: mo.tags || [],
          dogIds: m.petIds || [],
        }));

        const log: DailyLog = {
          id: m.id,
          dateKey: m.memoryDate,
          aiTitle: m.aiTitle || '기록',
          aiSummary: m.summary || '',
          representativePhotoPath: m.representativePhotoPath || undefined,
          moments,
        };

        if (!logs[m.memoryDate]) {
          logs[m.memoryDate] = [];
        }
        logs[m.memoryDate].push(log);
      }
      setDailyLogs(logs);
    } catch (e) {
      console.error('일기 동기화 실패:', e);
    }
  };

  return {
    dailyLogs,
    addDailyLog,
    removeDailyLog,
    getDailyLogsForDate,
    allLogs: filteredLogs,
    syncFromBackend,
  };
};
