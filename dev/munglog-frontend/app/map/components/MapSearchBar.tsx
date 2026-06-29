'use client';

import { useRef, useEffect } from 'react';
import { Navigation, Search, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { MapMemoryDetail } from '@/app/map/hooks/useMapMarkers';
import { getImagePath } from '@/lib/clientApi';

interface MapSearchBarProps {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  searchResults: MapMemoryDetail[];
  isSearching: boolean;
  showResults: boolean;
  onShowResults: (show: boolean) => void;
  onResultClick: (result: MapMemoryDetail) => void;
  onLocationClick: () => void;
}

export default function MapSearchBar({
  query,
  onChange,
  onClear,
  searchResults,
  isSearching,
  showResults,
  onShowResults,
  onResultClick,
  onLocationClick,
}: MapSearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onShowResults]);

  return (
    <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row gap-4 items-start">
      <div ref={containerRef} className="relative flex-1 max-w-md w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
          <input
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => onShowResults(true)}
            placeholder="장소나 추억을 검색해 보세요..."
            className="w-full pl-11 pr-12 py-4 bg-background/90 backdrop-blur-md border border-border rounded-[24px] shadow-2xl shadow-main-green/10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main-green/20 transition-all text-text-main"
          />
          {query && (
            <button
              onClick={onClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-green rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-text-sub" />
            </button>
          )}
        </div>

        {showResults && (isSearching || query) && (
          <div className="absolute top-full mt-3 w-full bg-background/95 backdrop-blur-lg rounded-[24px] shadow-2xl border border-border overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {isSearching ? (
                <div className="p-8 text-center text-text-sub text-sm font-bold">
                  <Sparkles className="w-5 h-5 animate-pulse text-main-yellow mx-auto mb-2" />
                  추억 속을 검색하고 있어요...
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      <p className="px-4 py-2 text-[10px] font-black text-main-green uppercase tracking-widest">
                        추억 사진 {searchResults.length}건
                      </p>
                      {searchResults.map((result) => (
                        <button
                          key={result.photoId}
                          onClick={() => onResultClick(result)}
                          className="w-full flex items-center gap-4 p-3 hover:bg-surface-green rounded-2xl transition-all text-left group"
                        >
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5">
                            <Image
                              src={getImagePath(result.path)}
                              alt=""
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-text-main truncate">
                              {result.moment?.locationName || '추억의 장소'}
                            </h4>
                            <p className="text-[11px] font-medium text-text-sub truncate">
                              {result.dailyLog.dateKey} · {result.moment?.aiTitle || result.dailyLog.aiTitle}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : query && !isSearching && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-surface-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-main-green/30" />
                      </div>
                      <p className="text-sm font-bold text-text-main">검색 결과가 없어요</p>
                      <p className="text-xs font-medium text-text-sub mt-1">다른 키워드로 검색해 보세요.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onLocationClick}
        className="p-4 bg-background/90 backdrop-blur-md border border-border rounded-2xl shadow-xl text-text-main hover:bg-main-green hover:text-white transition-all"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </div>
  );
}
