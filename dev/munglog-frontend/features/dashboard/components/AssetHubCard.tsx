'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import TimelineDatePicker from '@/app/calendar/components/TimelineDatePicker';
import { buildExpenseData, buildCategoryStats, formatAmount } from '../utils/expenseUtils';
import { EXPENSE_CAT_COLORS } from '../constants/scheduleTypeConfig';
import Skeleton from './Skeleton';
import { useDash, useExtra } from '../context/DashboardContext';

export default function AssetHubCard() {
  const { careRecords, loading } = useExtra();
  const { selectedYear, selectedMonth } = useDash();

  const getMonthRange = (year: number, month: number) => {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  };

  const initial = getMonthRange(selectedYear, selectedMonth);
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  const [hasCustomRange, setHasCustomRange] = useState(false);

  useEffect(() => {
    if (!hasCustomRange) {
      const { start, end } = getMonthRange(selectedYear, selectedMonth);
      setStartDate(start);
      setEndDate(end);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const monthlyExpense = startDate && endDate ? buildExpenseData(careRecords, startDate, endDate) : [];
  const expenseCategoryStats = startDate && endDate ? buildCategoryStats(careRecords, startDate, endDate) : [];

  const hasData = monthlyExpense.some(m => m.total > 0);
  const maxVal = Math.max(...monthlyExpense.map(m => m.total), 1);
  const totalAmount = expenseCategoryStats.reduce((s, m) => s + m.total, 0);

  const pieData = expenseCategoryStats.map(({ code, label, total }) => ({
    name: label,
    value: total,
    pct: totalAmount === 0 ? 0 : Math.round((total / totalAmount) * 100),
    color: EXPENSE_CAT_COLORS[code] ?? '#94a3b8',
  }));

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-5 min-h-[250px] lg:h-[250px]">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-text-main flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-deep-green" /> 생활 & 자산 관리
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          <Skeleton className="h-full w-full rounded-2xl" />
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1">
          {/* 왼쪽: 지출 현황 */}
          <div className="md:col-span-7 flex flex-col justify-between gap-4 pr-0 md:pr-6 border-r-0 md:border-r border-dashed border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-black text-text-sub uppercase tracking-wider">지출 월별 추이</span>
              <div className="flex items-center gap-1 text-[11px]">
                <TimelineDatePicker
                  value={startDate}
                  onChange={v => { if (v <= endDate) { setStartDate(v); setHasCustomRange(true); } }}
                  label="시작일"
                  variant="button"
                  align="top"
                />
                <span className="text-text-sub/50">~</span>
                <TimelineDatePicker
                  value={endDate}
                  onChange={v => { if (v >= startDate) { setEndDate(v); setHasCustomRange(true); } }}
                  label="종료일"
                  variant="button"
                  align="top"
                />
              </div>
            </div>

            {!hasData ? (
              <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-border/40">
                <p className="text-xs text-text-sub font-bold">지출 기록이 없어요</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyExpense} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
                        axisLine={false}
                        tickLine={false}
                        className="text-text-sub"
                      />
                      <YAxis
                        tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                        axisLine={false}
                        tickLine={false}
                        className="text-text-sub"
                        tickFormatter={v => v >= 10000 ? `${Math.floor(v / 10000)}만` : `${v}`}
                        width={30}
                      />
                      <Tooltip
                        formatter={(value) => [formatAmount(Number(value ?? 0)), '지출']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 700 }}
                        cursor={{ fill: 'rgba(34,197,94,0.08)' }}
                      />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {monthlyExpense.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.total === maxVal ? '#15803d' : entry.total > 0 ? '#22c55e' : '#e5e7eb'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 분야별 소비 도넛차트 */}
          <div className="md:col-span-5 flex flex-col justify-between pl-0 md:pl-6 h-full gap-3">
            <span className="text-[10px] font-black text-text-sub uppercase tracking-wider block">분야별 소비 비율</span>

            {totalAmount === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-border/40 h-32">
                <p className="text-xs text-text-sub font-bold">소비 내역이 없어요</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-row items-center justify-between gap-4 h-32">
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={24}
                        outerRadius={40}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatAmount(Number(value ?? 0)), '지출']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 700 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-32">
                  {pieData.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-text-sub truncate">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        <span className="text-text-main font-black">{entry.pct}%</span>
                        <span className="text-text-sub/40 text-[9px]">{formatAmount(entry.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
