'use client';

import { Calendar, MapPin, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import MomentImageSlider from '@/features/diary/components/MomentImageSlider';
import { MapMemoryDetail } from '@/app/map/hooks/useMapMarkers';

interface MarkerDetailPanelProps {
  detail: MapMemoryDetail;
  loading: boolean;
  photos: { id: string; path: string }[];
  onClose: () => void;
}

export default function MarkerDetailPanel({ detail, loading, photos, onClose }: MarkerDetailPanelProps) {
  return (
    <div className="absolute bottom-8 left-6 right-6 md:left-auto md:right-8 md:w-[400px] animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-background rounded-[32px] overflow-hidden shadow-2xl border border-border ring-1 ring-black/5">
        {loading ? (
          <div className="h-48 flex items-center justify-center text-text-sub text-sm font-bold">
            <MapPin className="w-5 h-5 animate-bounce text-main-green mr-2" />불러오는 중...
          </div>
        ) : (
          <>
            <div className="relative h-48">
              <MomentImageSlider photos={photos} alt={detail.moment.aiTitle || '추억 사진'} />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-1.5 z-10">
                {detail.moment.category && (
                  <span className="px-2.5 py-1 bg-main-green text-white text-[9px] font-black rounded-full shadow-lg uppercase tracking-widest">
                    {detail.moment.category}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-text-main text-[9px] font-black rounded-full shadow-lg">
                  {detail.dailyLog.dateKey}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-text-main tracking-tight">
                  {detail.moment.locationName || '추억의 장소'}
                </h3>
                <p className="text-sm font-bold text-text-sub flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-main-yellow fill-main-yellow" />
                  {detail.moment.aiTitle || detail.dailyLog.aiTitle}
                </p>
              </div>
              {detail.moment.aiDiary && (
                <div className="bg-surface-green/50 p-4 rounded-2xl border border-main-green/5 italic text-sm font-medium text-text-main/80 leading-relaxed max-h-[120px] overflow-y-auto no-scrollbar">
                  &quot;{detail.moment.aiDiary}&quot;
                </div>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/calendar?date=${detail.dailyLog.dateKey}`}
                  className="flex-1 py-3.5 bg-main-green text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-main-green/20"
                >
                  <Calendar className="w-3.5 h-3.5" /> 전체 일기 보기
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
