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
  month: string; // YYYY-MM
  totalAmount: number;
  medicalAmount: number;
  otherAmount: number;
}

export const dashboardApi = {
  // 1. 통합 요약 정보
  getSummary: async (params: { dogId?: string; startDate: string; endDate: string }): Promise<DashboardSummary> => {
    const response = await apiClient.get('/dashboard/summary', { params: toDashboardParams(params) });
    return response.data;
  },

  // 2. 지출 항목 분석 (도넛 차트용)
  getExpenseAnalysis: async (params: { dogId?: string; startDate: string; endDate: string }): Promise<ExpenseAnalysis> => {
    const response = await apiClient.get('/dashboard/charts/expense-analysis', { params: toDashboardParams(params) });
    return response.data;
  },

  // 3. 월별 지출 추이 (라인 차트용)
  getExpenseTrend: async (params: { dogId?: string; startDate: string; endDate: string }): Promise<MonthlyTrend[]> => {
    const response = await apiClient.get('/dashboard/charts/expense-trend', { params: toDashboardParams(params) });
    return response.data;
  }
};

function toDashboardParams(params: { dogId?: string; startDate: string; endDate: string }) {
  return {
    petId: params.dogId,
    startDate: params.startDate,
    endDate: params.endDate,
  };
}
