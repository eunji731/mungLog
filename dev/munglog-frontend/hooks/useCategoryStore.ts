import { create } from 'zustand';
import { categoryApi, type CategoryItem } from '@/api/categoryApi';
import { type StaticCodeItem, RECORD_TYPE_CODES, SCHEDULE_TYPE_CODES } from '@/lib/codeGroups';

function toStaticCodeItem(item: CategoryItem): StaticCodeItem {
  return {
    id: item.id,
    code: item.code,
    codeName: item.displayName,
    sortOrder: item.sortOrder,
  };
}

interface CategoryStore {
  careCategories: StaticCodeItem[];
  scheduleCategories: StaticCodeItem[];
  isLoaded: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  careCategories: RECORD_TYPE_CODES,
  scheduleCategories: SCHEDULE_TYPE_CODES,
  isLoaded: false,

  fetchCategories: async () => {
    if (get().isLoaded) return;
    try {
      const [careRes, scheduleRes] = await Promise.all([
        categoryApi.getCareCategories(),
        categoryApi.getScheduleCategories(),
      ]);
      const care = careRes.data.filter(c => c.isActive).map(toStaticCodeItem);
      const schedule = scheduleRes.data.filter(c => c.isActive).map(toStaticCodeItem);
      set({
        careCategories: care.length > 0 ? care : RECORD_TYPE_CODES,
        scheduleCategories: schedule.length > 0 ? schedule : SCHEDULE_TYPE_CODES,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },
}));
