import { apiClient } from '@/lib/apiClient';

export interface CategoryItem {
  id: number;
  code: string;
  displayName: string;
  icon: string | null;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
}

export const categoryApi = {
  getCareCategories: () => apiClient.get<CategoryItem[]>('/categories/care'),
  getScheduleCategories: () => apiClient.get<CategoryItem[]>('/categories/schedule'),
};
