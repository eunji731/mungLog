import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Line, ComposedChart
} from 'recharts';
import { dashboardApi, type ExpenseAnalysis, type MonthlyTrend } from '@/api/dashboardApi';

interface ExpenseChartProps {
  filters: { dogId?: string; startDate: string; endDate: string };
}

const COLORS = ['#FF6B00', '#FF9E4D', '#FFC280', '#FFE0B3', '#F5F5F5', '#E5E5E5'];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ filters }) => {
  const [analysis, setAnalysis] = useState<ExpenseAnalysis | null>(null);
  const [trends, setTrend] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const [analysisData, trendData] = await Promise.all([
          dashboardApi.getExpenseAnalysis(filters),
          dashboardApi.getExpenseTrend(filters)
        ]);
        setAnalysis(analysisData);
        setTrend(trendData);
      } catch (err) {
        console.error('Chart Load Failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (filters.startDate) fetchChartData();
  }, [filters]);

  if (isLoading) {
    return <div className="h-[400px] flex items-center justify-center text-stone-300 font-bold animate-pulse">데이터 분석 중...</div>;
  }

  return (
    <div className="p-8 lg:p-10 flex flex-col lg:grid lg:grid-cols-12 gap-12">

      {/* 1. 월별 지출 추이 (Composed Chart로 변경하여 라인과 면적 혼합) */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[20px] font-black text-[#2D2D2D] tracking-tight">Spending Trends</h3>
            <p className="text-[13px] text-stone-400 font-medium">병원비, 일반지출 및 전체 합계를 비교합니다.</p>
          </div>
          {/* 범례 커스텀 */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
              <span className="text-[11px] font-black text-stone-400 uppercase">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span className="text-[11px] font-black text-stone-400 uppercase">Medical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span className="text-[11px] font-black text-stone-400 uppercase">Other</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 800, fill: '#A0A0A0' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 800, fill: '#A0A0A0' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 900 }}
                cursor={{ stroke: '#FF6B00', strokeWidth: 1, strokeDasharray: '5 5' }}
              />

              {/* 1. 합계 (면적) */}
              <Area
                type="monotone"
                dataKey="totalAmount"
                name="전체 합계"
                stroke="#FF6B00"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />

              {/* 2. 병원비 (파란선) */}
              <Line
                type="monotone"
                dataKey="medicalAmount"
                name="병원비"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />

              {/* 3. 일반 지출 (회색선) */}
              <Line
                type="monotone"
                dataKey="otherAmount"
                name="일반 지출"
                stroke="#D1D5DB"
                strokeWidth={2}
                dot={{ r: 4, fill: '#D1D5DB', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 카테고리 분석 (Donut Chart) */}
      <div className="lg:col-span-4 space-y-8 border-l border-stone-50 pl-0 lg:pl-12">
        <div className="space-y-1 text-center lg:text-left">
          <h3 className="text-[20px] font-black text-[#2D2D2D] tracking-tight">Analysis</h3>
          <p className="text-[13px] text-stone-400 font-medium">항목별 지출 비율입니다.</p>
        </div>

        <div className="h-[240px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analysis?.categories || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="amount"
                nameKey="categoryName"
                animationDuration={1500}
              >
                {analysis?.categories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
            <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest leading-none">Total</span>
            <span className="text-[20px] font-black text-[#2D2D2D] mt-1 tabular-nums">
              {((analysis?.totalAmount || 0) / 10000).toFixed(1)}<span className="text-[12px] ml-0.5">만</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {analysis?.categories.slice(0, 3).map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${COLORS[idx % COLORS.length]}`}></div>
                <span className="text-[13px] font-bold text-stone-600">{cat.categoryName}</span>
              </div>
              <span className="text-[13px] font-black text-[#2D2D2D]">{cat.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
