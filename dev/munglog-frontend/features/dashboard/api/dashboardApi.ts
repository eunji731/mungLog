import { apiClient } from '@/lib/apiClient';

export interface DashboardSummary {
  stats: {
    totalExpense: number;
    medicalCount: number;
    activeMedicationCount: number;
    upcomingScheduleCount: number;
  };
  topSymptoms: Array<{ name: string; count: number }>;
  upcomingSchedules: Array<{
    id: string | number;
    title: string;
    scheduleDate: string;
    location?: string;
    dDay: number;
  }>;
  recentRecords: Array<{
    id: string | number;
    type: string;
    date: string;
    title: string;
    amount: number;
  }>;
}

export interface ExpenseAnalysis {
  totalAmount: number;
  medicalAmount: number;
  otherAmount: number;
  categories: Array<{
    categoryCode: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
}

export interface MonthlyTrend {
  month: string;
  totalAmount: number;
  medicalAmount: number;
  otherAmount: number;
}

export const dashboardApi = {
  getSummary: async (params: { dogId?: string; startDate: string; endDate: string }): Promise<DashboardSummary> => {
    const response = await apiClient.get('/dashboard/summary', { params: toDashboardParams(params) });
    return response.data;
  },

  getExpenseAnalysis: async (params: { dogId?: string; startDate: string; endDate: string }): Promise<ExpenseAnalysis> => {
    const response = await apiClient.get('/dashboard/charts/expense-analysis', { params: toDashboardParams(params) });
    return response.data;
  },

  getExpenseTrend: async (params: { dogId?: string; startDate: string; endDate: string }): Promise<MonthlyTrend[]> => {
    const response = await apiClient.get('/dashboard/charts/expense-trend', { params: toDashboardParams(params) });
    return response.data;
  },
};

function toDashboardParams(params: { dogId?: string; startDate: string; endDate: string }) {
  return {
    petId: params.dogId,
    startDate: params.startDate,
    endDate: params.endDate,
  };
}
