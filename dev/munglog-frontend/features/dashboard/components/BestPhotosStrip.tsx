'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Camera } from 'lucide-react';
import { getImagePath } from '@/app/common/lib/clientApi';
import Skeleton from './Skeleton';
import { useDash } from '../context/DashboardContext';

export default function BestPhotosStrip() {
  const { summary, summaryLoading } = useDash();
  const photos = (summary?.bestPhotos ?? []).slice(0, 4);

  if (summaryLoading) {
    return (
      <div className="space-y-4 w-full flex flex-col flex-1">
        <h2 className="text-lg font-black text-text-main flex items-center gap-2 px-1">
          <Trophy className="w-5 h-5 text-main-yellow fill-main-yellow" /> 베스트 포토
        </h2>
        <div className="grid grid-cols-2 gap-3 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="space-y-4 w-full flex flex-col flex-1">
        <h2 className="text-lg font-black text-text-main flex items-center gap-2 px-1">
          <Trophy className="w-5 h-5 text-main-yellow fill-main-yellow" /> 베스트 포토
        </h2>
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-8 text-center bg-surface-green/20 gap-2 flex-1">
          <Camera className="w-8 h-8 text-text-sub/40" />
          <div>
            <p className="text-xs font-black text-text-main">베스트 사진이 없어요</p>
            <p className="text-[10px] text-text-sub font-bold mt-1 leading-normal">반려견과의 하루 일기록에 멋진 사진을 올려주세요!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full flex flex-col flex-1">
      <h2 className="text-lg font-black text-text-main flex items-center gap-2 px-1">
        <Trophy className="w-5 h-5 text-main-yellow fill-main-yellow" /> 베스트 포토
      </h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {photos.map((photo, i) => (
          <Link
            key={i}
            href={`/calendar?date=${photo.memoryDate}`}
            className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all border border-border bg-background w-full"
          >
            <Image
              src={getImagePath(photo.photoPath)}
              alt="베스트 사진"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-black/55 backdrop-blur-sm rounded-full text-[10px] font-black text-white z-10">
              ★ {photo.vibeScore}
            </div>
            {photo.aiComment && (
              <p className="absolute bottom-2.5 left-2.5 right-2.5 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2 leading-relaxed z-10">
                {photo.aiComment}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
