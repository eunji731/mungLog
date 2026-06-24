import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/pages/Home/components/Header';
import { DashboardFilters } from '@/pages/Home/components/DashboardFilters';
import { KpiCards } from '@/pages/Home/components/KpiCards';
import { MainDataTable } from '@/pages/Home/components/MainDataTable';
import { ExpenseChart } from '@/pages/Home/components/ExpenseChart';
import { HealthWidgets } from '@/pages/Home/components/HealthWidgets';
import { QuickLogFeed } from '@/pages/Home/components/QuickLogFeed';
import { dashboardApi } from '@/api/dashboardApi';
import type { DashboardSummary } from '@/api/dashboardApi';

export const HomePage = () => {
  const [filters, setFilters] = useState<{ dogId?: string; startDate: string; endDate: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 페칭 함수
  const fetchDashboardData = async (f: { dogId?: string; startDate: string; endDate: string }) => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getSummary(f);
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard Data Load Failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터가 변경될 때마다 호출되는 콜백
  const handleFilterChange = useCallback((newFilters: { dogId?: string; startDate: string; endDate: string }) => {
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAF8] font-sans text-[#2D2D2D] pb-32">
      <Header />

      <main className="max-w-[1600px] mx-auto px-6 md:px-10">

        {/* 1. HERO BRIEFING SECTION */}
        <section className="pt-12 pb-12">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 border-b border-stone-100 pb-10 text-center md:text-left">
            <div className="space-y-4">
              <h1 className="text-[42px] lg:text-[64px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
                Dashboard <span className="text-[#FF6B00]">Insight.</span>
              </h1>
            </div>
            <div className="flex w-full md:w-auto justify-center">
              <DashboardFilters onFilterChange={handleFilterChange} />
            </div>
          </header>

          <KpiCards 
            data={dashboardData?.stats} 
            isLoading={isLoading} 
          />
        </section>

        {/* 2. MAIN DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-4">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="bg-white rounded-[32px] p-1 border border-[#F0F0F0] shadow-[0_30px_80px_rgba(0,0,0,0.02)]">
              {filters && <ExpenseChart filters={filters} />}
            </div>

            <div className="bg-white rounded-[32px] p-1 border border-[#F0F0F0] shadow-[0_30px_80px_rgba(0,0,0,0.02)]">
              <MainDataTable records={dashboardData?.recentRecords} isLoading={isLoading} />
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-24">
            <div className="bg-white rounded-[40px] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <HealthWidgets 
                symptoms={dashboardData?.topSymptoms} 
                schedules={dashboardData?.upcomingSchedules} 
              />
            </div>

            <QuickLogFeed selectedDogId={filters?.dogId} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomePage;
