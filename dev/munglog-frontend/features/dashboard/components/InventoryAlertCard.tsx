'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Skeleton from './Skeleton';
import { useExtra } from '../context/DashboardContext';

export default function InventoryAlertCard() {
  const { lowStockItems, expiringItems, loading } = useExtra();
  const alertCount = lowStockItems.length + expiringItems.length;

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-4 min-h-[250px] lg:h-[250px] justify-between">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-text-main flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" /> 인벤토리 경고
          </h3>
          {alertCount > 0 && (
            <span className="text-[9px] font-black bg-red-50 dark:bg-red-900/10 text-red-500 px-1.5 py-0.5 rounded-full">
              {alertCount}건
            </span>
          )}
        </div>
        <Link href="/inventory" className="text-[10px] font-black text-text-sub hover:text-main-green transition-colors">
          전체 보기
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : lowStockItems.length === 0 && expiringItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-surface-green/10 rounded-2xl border border-main-green/5">
          <CheckCircle2 className="w-6 h-6 text-main-green opacity-40 mb-1" />
          <p className="text-xs text-main-green font-black">모든 재고 상태 양호</p>
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1 max-h-[140px] mt-1">
          {lowStockItems.slice(0, 3).map(item => (
            <Link
              key={item.id}
              href="/inventory"
              className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100/40 hover:bg-orange-100/60 dark:hover:bg-orange-900/20 transition-all text-xs"
            >
              <span className="font-black text-text-main truncate pr-2">{item.name}</span>
              <span className="text-[9px] font-black text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                {item.stock}개 남음
              </span>
            </Link>
          ))}
          {expiringItems.slice(0, 3).map(item => {
            const daysLeft = Math.ceil(
              (new Date(item.expiryDateSpecific!).getTime() - Date.now()) / 86400000
            );
            return (
              <Link
                key={item.id}
                href="/inventory"
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 dark:bg-red-900/10 border border-red-100/40 hover:bg-red-100/60 dark:hover:bg-red-900/20 transition-all text-xs"
              >
                <span className="font-black text-text-main truncate pr-2">{item.name}</span>
                <span className="text-[9px] font-black text-red-500 bg-red-100 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                  {daysLeft === 0 ? '오늘 만료' : `D-${daysLeft}`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
