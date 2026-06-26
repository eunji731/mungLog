'use client';

import { MapPin } from 'lucide-react';
import Skeleton from './Skeleton';
import { useDash } from '../context/DashboardContext';

export default function FavoritePlacesCard() {
  const { summary, summaryLoading } = useDash();
  const places = summary?.favoritePlaces ?? [];

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 lg:p-8 space-y-4 w-full h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-text-main flex items-center gap-2">
          <MapPin className="w-5 h-5 text-main-green" /> 자주 가는 곳
        </h3>
        <span className="text-[10px] font-black text-text-sub">이번 달 기준</span>
      </div>
      {summaryLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : places.length === 0 ? (
        <p className="text-sm text-text-sub font-bold text-center py-4">이번 달 방문 기록이 없어요</p>
      ) : (
        <div className="space-y-3">
          {places.map((place, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                i === 0 ? 'bg-main-yellow text-white' : i === 1 ? 'bg-border text-text-sub' : i === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-500' : 'bg-surface-green text-text-sub'
              }`}>
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-bold text-text-main truncate">{place.locationName}</span>
              <span className="text-xs font-black text-text-sub">{place.count}일</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
