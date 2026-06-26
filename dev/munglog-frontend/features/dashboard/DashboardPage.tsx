'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Stethoscope } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';
import { useDashboardExtra } from './hooks/useDashboardExtra';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { DashboardCtx, ExtraCtx } from './context/DashboardContext';
import MonthNavigator from './components/MonthNavigator';
import DashboardHeader from './components/DashboardHeader';
import BestPhotosStrip from './components/BestPhotosStrip';
import FavoritePlacesCard from './components/FavoritePlacesCard';
import AiEmptyState from './components/AiEmptyState';
import AiMonthlyReportCard from './components/AiMonthlyReportCard';
import AiActivityCard from './components/AiActivityCard';
import AiLocationCard from './components/AiLocationCard';
import CareHubCard from './components/CareHubCard';
import AssetHubCard from './components/AssetHubCard';
import InventoryAlertCard from './components/InventoryAlertCard';
import StreaksCard from './components/StreaksCard';
import Skeleton from './components/Skeleton';

export default function DashboardPage() {
  const dashboard = useDashboard();
  const extra = useDashboardExtra(dashboard.selectedYear, dashboard.selectedMonth);
  const { aiReport, aiLoading, aiRefreshing, refreshAiReport } = dashboard;
  const { selectedPetId } = usePet();
  const isAll = selectedPetId === ALL_PETS_ID;
  const [refreshLimitToast, setRefreshLimitToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'care' | 'ai'>('care');

  useEffect(() => {
    if (!isAll && activeTab === 'ai') setActiveTab('care');
  }, [isAll, activeTab]);

  const handleRefresh = async () => {
    const result = await refreshAiReport();
    if (result === 'limit') {
      setRefreshLimitToast(true);
      setTimeout(() => setRefreshLimitToast(false), 3000);
    }
  };

  return (
    <ExtraCtx.Provider value={extra}>
    <DashboardCtx.Provider value={dashboard}>
    <div className="flex-1 flex flex-col min-h-0 bg-surface-green/30 overflow-y-auto no-scrollbar p-4 lg:p-8 animate-in fade-in duration-300">
      {refreshLimitToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl">
          오늘 새로고침 횟수(3회)를 모두 사용했어요
        </div>
      )}
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">

        <DashboardHeader />

        {/* 탭 네비게이션 */}
        <div className="flex flex-col gap-0 mt-0 mb-3 w-full select-none">
          <div className="flex justify-between items-center px-1 border-b border-border/80 w-full">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('care')}
                className={`relative pb-3 text-[15.5px] font-black cursor-pointer transition-all duration-200 outline-none flex items-center gap-2 select-none ${
                  activeTab === 'care' ? 'text-main-green' : 'text-text-sub hover:text-text-main'
                }`}
              >
                <Stethoscope className={`w-4.5 h-4.5 transition-transform ${activeTab === 'care' ? 'scale-105' : ''}`} />
                <span>케어 및 관리</span>
                {activeTab === 'care' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-main-green rounded-t-full animate-in fade-in duration-200" />
                )}
              </button>

              {isAll && (
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`relative pb-3 text-[15.5px] font-black cursor-pointer transition-all duration-200 outline-none flex items-center gap-2 select-none ${
                    activeTab === 'ai' ? 'text-main-green' : 'text-text-sub hover:text-text-main'
                  }`}
                >
                  <Sparkles className={`w-4.5 h-4.5 transition-all ${activeTab === 'ai' ? 'text-main-yellow fill-main-yellow scale-105' : ''}`} />
                  <span>AI 라이프 리포트</span>
                  {activeTab === 'ai' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-main-green rounded-t-full animate-in fade-in duration-200" />
                  )}
                </button>
              )}
            </div>

            <div className="pb-2">
              <MonthNavigator />
            </div>
          </div>

          {!isAll && (
            <div className="flex items-start gap-2.5 mt-3 p-3.5 bg-surface-green/40 dark:bg-main-green/5 border border-main-green/10 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
              <Sparkles className="w-4.5 h-4.5 text-main-green shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-text-main">AI 라이프 리포트 안내</p>
                <p className="text-[11px] font-bold text-text-sub mt-0.5 leading-relaxed">
                  AI 라이프 리포트는 등록된 <span className="text-main-green font-black">전체 일기를 기준</span>으로 종합 분석하여 작성됩니다.
                  따라서 개별 반려동물을 선택했을 때는 리포트 탭이 노출되지 않으며, 오른쪽 사이드메뉴에서 <span className="text-main-green font-black">모든 가족</span>을 선택했을 때만 확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'care' ? (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="w-full">
              <CareHubCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 flex">
                <div className="w-full flex flex-col">
                  <AssetHubCard />
                </div>
              </div>
              <div className="lg:col-span-4 flex">
                <div className="w-full flex flex-col">
                  <InventoryAlertCard />
                </div>
              </div>
            </div>

            <div className="w-full">
              <StreaksCard />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {aiLoading ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 bg-deep-green rounded-[40px] p-8 space-y-4 min-h-[350px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-40 bg-white/20" />
                      <Skeleton className="h-4 w-full bg-white/20" />
                      <Skeleton className="h-4 w-5/6 bg-white/20" />
                    </div>
                  </div>
                  <div className="lg:col-span-4 bg-background rounded-[32px] border border-border p-6 lg:p-8 space-y-4 min-h-[350px] flex flex-col justify-between">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-2 gap-3 flex-1 mt-4">
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                      <Skeleton className="aspect-square rounded-2xl w-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-background rounded-[32px] border border-border p-6 space-y-4 h-52 flex flex-col justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="bg-background rounded-[32px] border border-border p-6 space-y-4 h-52 flex flex-col justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                  <div className="lg:col-span-4 flex">
                    <div className="bg-background rounded-[32px] border border-border p-6 lg:p-8 space-y-4 w-full h-full flex flex-col justify-between">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <div className="space-y-3 mt-6">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !aiReport?.hasData ? (
              <div className="w-full">
                <AiEmptyState
                  onRefresh={handleRefresh}
                  refreshing={aiRefreshing}
                  remainingRefreshCount={aiReport?.remainingRefreshCount ?? null}
                  recordCount={aiReport?.recordCount ?? null}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 flex">
                    <AiMonthlyReportCard onRefresh={handleRefresh} refreshing={aiRefreshing} />
                  </div>
                  <div className="lg:col-span-4 flex">
                    <div className="w-full bg-background rounded-[32px] border border-border shadow-sm p-6 lg:p-8 flex flex-col justify-between min-h-[350px]">
                      <BestPhotosStrip />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex-1 flex">
                      <AiActivityCard />
                    </div>
                    <div className="flex-1 flex">
                      <AiLocationCard />
                    </div>
                  </div>
                  <div className="lg:col-span-4 flex">
                    <FavoritePlacesCard />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </DashboardCtx.Provider>
    </ExtraCtx.Provider>
  );
}
