'use client';

import Image from 'next/image';
import { Heart, Plus, Flame, PartyPopper } from 'lucide-react';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/app/common/lib/clientApi';
import Skeleton from './Skeleton';
import { useDash } from '../context/DashboardContext';

export default function DashboardHeader() {
  const { pets, selectedPetId } = usePet();
  const { summary, summaryLoading, selectedYear, selectedMonth, isCurrentMonth } = useDash();

  const petInfo = summary?.pet;
  const isAll = selectedPetId === ALL_PETS_ID;
  const primaryPet = pets.find(p => p.id === selectedPetId);
  const isBirthday = !isAll && petInfo?.birthdayDday === 0;

  const stats = summary?.monthlyStats;
  const streak = summary?.streak;
  const monthLabel = isCurrentMonth ? '이달의 활동' : `${selectedMonth}월 활동`;

  if (summaryLoading) {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 md:py-6 pb-2 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="flex items-stretch gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
          <Skeleton className="h-[52px] flex-1 md:w-28 rounded-2xl" />
          <Skeleton className="h-[52px] flex-1 md:w-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-stretch justify-between gap-6 py-4 md:py-6 pb-2">
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16 shrink-0">
          <div className={`absolute inset-0 rounded-full shadow-sm ring-2 ${isBirthday ? 'ring-main-yellow animate-bounce' : 'ring-main-green/20'}`} />
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background bg-background shadow-inner">
            {isAll ? (
              <div className="w-full h-full bg-gradient-to-br from-main-green to-deep-green flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
              </div>
            ) : primaryPet ? (
              <Image src={getImagePath(primaryPet.photo, 'profiles')} alt={primaryPet.name} fill className="object-cover animate-in fade-in duration-300" />
            ) : (
              <div className="w-full h-full bg-surface-green flex items-center justify-center">
                <Plus className="w-6 h-6 text-main-green opacity-40" />
              </div>
            )}
          </div>
          {isBirthday && (
            <div className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-main-yellow rounded-full flex items-center justify-center shadow-md z-20">
              <PartyPopper className="w-3 text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-text-main tracking-tight">
              {isAll ? '안녕하세요, 모든 가족!' : `반갑습니다, ${petInfo?.name ?? '반려동물'}!`}
            </h1>
            {isBirthday && (
              <span className="bg-main-yellow/20 text-main-yellow dark:text-main-yellow text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse border border-main-yellow/30">
                🎉 오늘 생일!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-1 text-xs font-bold text-text-sub">
            {isAll ? (
              <span className="text-[11px] font-bold text-main-green bg-surface-green dark:bg-main-green/10 px-2 py-0.5 rounded-full">
                총 {pets.length}마리 반려 중
              </span>
            ) : petInfo ? (
              <>
                <span>{petInfo.breed}</span>
                <span className="text-border/80">•</span>
                <span>{petInfo.ageLabel}</span>
              </>
            ) : null}
            {!isAll && petInfo?.daysTogether != null && (
              <>
                <span className="text-border/80">•</span>
                <span className="text-main-green font-black">함께한 지 D+{petInfo.daysTogether}일</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-stretch gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
        <div className="flex-1 md:flex-none flex items-center gap-2.5 bg-background dark:bg-surface-green/5 hover:bg-light-green/20 dark:hover:bg-main-green/5 border border-border px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200">
          <div className="w-8 h-8 rounded-xl bg-main-yellow/10 flex items-center justify-center shrink-0">
            <Flame className="w-4.5 h-4.5 text-main-yellow fill-main-yellow shrink-0" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-sub leading-none mb-1">연속 기록</p>
            <p className="text-xs font-black text-text-main leading-none">{streak?.current ?? 0}일째</p>
          </div>
        </div>

        <div className="flex-1 md:flex-none flex flex-col justify-center bg-background dark:bg-surface-green/5 border border-border px-5 py-2.5 rounded-2xl shadow-sm">
          <p className="text-[9px] font-black text-text-sub uppercase tracking-wider mb-1.5 text-center md:text-left">{monthLabel}</p>
          <div className="flex items-center justify-around md:justify-start gap-5">
            <div className="text-center min-w-[32px]">
              <p className="text-[10px] font-bold text-text-sub">기록</p>
              <p className="text-xs font-black text-text-main mt-0.5">{stats?.recordedDays ?? 0}일</p>
            </div>
            <div className="w-[1px] h-6 bg-border/80" />
            <div className="text-center min-w-[32px]">
              <p className="text-[10px] font-bold text-text-sub">장소</p>
              <p className="text-xs font-black text-text-main mt-0.5">{stats?.visitedPlaces ?? 0}곳</p>
            </div>
            <div className="w-[1px] h-6 bg-border/80" />
            <div className="text-center min-w-[32px]">
              <p className="text-[10px] font-bold text-text-sub">사진</p>
              <p className="text-xs font-black text-text-main mt-0.5">{stats?.bestPhotosCount ?? 0}장</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
