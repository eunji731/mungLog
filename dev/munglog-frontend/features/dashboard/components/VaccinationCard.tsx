'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Calendar, Users, Syringe, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/app/common/hooks/useToast';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { useVaccinationRecords } from '@/features/family/hooks/useVaccinationRecords';
import { formatDDay } from '@/utils/vaccinationDDay';
import { getImagePath } from '@/lib/clientApi';
import { scheduleApi } from '@/api/scheduleApi';
import VaccinationDDayBadge from '@/features/family/components/VaccinationDDayBadge';
import Skeleton from './Skeleton';

const STATUS_CONFIG = {
  OK: {
    bg: 'bg-emerald-50/30 dark:bg-emerald-950/5 border-emerald-100/70 hover:bg-emerald-50/50',
    border: 'border-emerald-100/70 dark:border-emerald-900/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    label: '정상',
  },
  SOON: {
    bg: 'bg-amber-50/30 dark:bg-amber-950/5 border-amber-100/70 hover:bg-amber-50/50',
    border: 'border-amber-100/70 dark:border-amber-900/10',
    text: 'text-amber-700 dark:text-amber-400',
    label: '임박',
  },
  OVERDUE: {
    bg: 'bg-red-50/30 dark:bg-red-950/5 border-red-100/70 hover:bg-red-50/50',
    border: 'border-red-100/70 dark:border-red-900/10',
    text: 'text-rose-700 dark:text-rose-400',
    label: '접종필요',
  },
};

export default function VaccinationCard() {
  const { pets, selectedPetId } = usePet();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const isAll = selectedPetId === ALL_PETS_ID;

  // Local active pet ID when "All pets" is selected
  const [localActivePetId, setLocalActivePetId] = useState<string | null>(null);

  // Determine the pet ID to load records for
  const currentPetId = isAll ? (localActivePetId || pets[0]?.id || null) : selectedPetId;

  // Update local active pet ID if it's currently invalid or "All pets" is newly selected
  useEffect(() => {
    if (isAll && pets.length > 0) {
      if (!localActivePetId || !pets.some(p => p.id === localActivePetId)) {
        setLocalActivePetId(pets[0].id);
      }
    }
  }, [isAll, pets, localActivePetId]);

  // Fetch vaccination records and summaries for the active pet
  const { summary, isLoading } = useVaccinationRecords(currentPetId || '');

  const handleNavigateToCreateSchedule = (item: any) => {
    if (!currentPetId || !item.dDayInfo?.nextDueDate) return;

    const params = new URLSearchParams();
    params.set('date', item.dDayInfo.nextDueDate);
    params.set('dogId', currentPetId);
    params.set('scheduleTypeId', '3'); // 예방접종 일정 유형 (VACCINATION)
    params.set('vaccinationTypeId', String(item.vaccinationTypeId));
    params.set('title', `${item.vaccinationTypeName} 예방접종`);

    router.push(`/schedules/new?${params.toString()}`);
  };

  const hasPets = pets.length > 0;
  const activePetName = pets.find(p => p.id === currentPetId)?.name || '';

  return (
    <div className="bg-background rounded-[32px] border border-border shadow-sm p-6 flex flex-col gap-4.5 min-h-[250px] transition-all">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-text-main flex items-center gap-1.5 text-xs sm:text-sm">
            <Syringe className="w-4.5 h-4.5 text-main-green" /> 예방접종 D-Day 요약
          </h3>
          {summary.some(item => item.dDayInfo?.status === 'OVERDUE') && (
            <span className="text-[9px] font-black bg-red-50 dark:bg-red-900/10 text-red-500 px-1.5 py-0.5 rounded-full animate-pulse">
              접종 필요
            </span>
          )}
        </div>
        <Link
          href="/schedules?type=VACCINATION"
          className="text-[10px] font-black text-text-sub hover:text-main-green transition-colors"
        >
          기록 관리
        </Link>
      </div>

      {/* 안내 문구 */}
      <div className="flex flex-col gap-2 p-3.5 bg-zinc-50/50 dark:bg-zinc-900/20 border border-border/60 rounded-2xl animate-in fade-in duration-200 select-none shrink-0">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-[11px] font-semibold text-text-sub leading-relaxed">
            예방접종 일정 및 접종 주기는 <span className="text-main-green font-black">케어기록</span> 또는 <span className="text-main-green font-black">가족 관리 &gt; 동물등록증</span>의 접종 기록에서 관리할 수 있습니다.
          </div>
        </div>
        <div className="mt-1 pt-1.5 border-t border-border/40 text-[9px] sm:text-[10px] text-text-sub/80 space-y-1">
          <p className="font-bold text-text-main flex items-center gap-1">
            💡 일정 예약(캘린더) vs 바로 케어기록(접종 완료) 가이드
          </p>
          <ul className="list-disc pl-3.5 space-y-0.5 font-medium leading-relaxed">
            <li>
              <span className="font-black text-main-green">일정 등록 (달력 버튼):</span> 미래 접종 예정일에 맞춰 예약을 등록할 때 사용합니다. 실제 접종 후 일정 상세에서 <span className="underline font-bold">케어기록으로 전환</span>할 수 있습니다.
            </li>
            <li>
              <span className="font-black text-main-green">바로 케어기록:</span> 캘린더 등록 없이 이미 접종을 완료한 경우, <span className="underline font-bold">기록 관리 &gt; 새 케어기록 등록</span>을 통해 완료된 내역을 직접 기록합니다.
            </li>
          </ul>
        </div>
      </div>

      {/* 모든 아이들 선택 시 각 아이를 구분할 수 있는 탭 메뉴 */}
      {isAll && hasPets && (
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar border-b border-border/40 select-none shrink-0">
          {pets.map((pet) => {
            const isActive = currentPetId === pet.id;
            return (
              <button
                key={pet.id}
                onClick={() => setLocalActivePetId(pet.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-200 text-[11px] shrink-0 select-none ${
                  isActive
                    ? 'bg-main-green text-white border-main-green shadow-md shadow-main-green/10 font-extrabold'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-border/80 text-text-sub hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 font-bold'
                }`}
              >
                {pet.photo ? (
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-background">
                    <Image
                      src={getImagePath(pet.photo, 'profiles')}
                      alt={pet.name}
                      fill
                      sizes="16px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border border-background text-[8px] font-black uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-main-green/10 text-main-green'
                    }`}
                  >
                    {pet.name[0]}
                  </div>
                )}
                <span>{pet.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 예방접종 내용 */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 flex-1">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : !hasPets ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-border/40">
          <ShieldCheck className="w-8 h-8 text-text-sub opacity-30 mb-2" />
          <p className="text-xs text-text-sub font-black">등록된 반려동물이 없습니다</p>
          <Link href="/family" className="mt-2 text-[10px] font-black text-main-green underline">
            가족 등록하러 가기
          </Link>
        </div>
      ) : summary.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-border/40">
          <AlertCircle className="w-8 h-8 text-text-sub opacity-30 mb-2" />
          <p className="text-xs text-text-sub font-black">
            {activePetName ? `${activePetName}의 ` : ''}등록된 예방접종 기록이 없습니다
          </p>
          <Link
            href={`/schedules/new?scheduleTypeId=3${currentPetId ? `&dogId=${currentPetId}` : ''}`}
            className="mt-2 text-[10px] font-black text-main-green underline"
          >
            예방접종 등록하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 flex-1">
          {summary.map((item) => {
            const dDayInfo = item.dDayInfo;
            const status = dDayInfo?.status || 'OK';
            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OK;
            return (
              <div
                key={item.vaccinationTypeId}
                className={`p-3 rounded-2xl border hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-2.5 ${cfg.bg} ${cfg.border}`}
              >
                {/* 상단: 타이틀 */}
                <div className="min-w-0">
                  <p
                    className="text-[11px] font-black text-text-main truncate"
                    title={item.vaccinationTypeName}
                  >
                    {item.vaccinationTypeName}
                  </p>
                </div>

                {/* 중간: 디데이 배지 및 일정 등록 버튼 */}
                <div className="flex items-center justify-between gap-1.5">
                  <VaccinationDDayBadge dDayInfo={dDayInfo} size="xs" />
                  {dDayInfo?.nextDueDate && (status === 'SOON' || status === 'OVERDUE') && (
                    <button
                      onClick={() => handleNavigateToCreateSchedule(item)}
                      className="p-1 rounded-lg border border-border/60 bg-background dark:bg-zinc-800 hover:border-main-green hover:text-main-green text-text-sub transition-all active:scale-90"
                      title="다음 접종 일정 등록"
                    >
                      <Calendar className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 하단: 접종 내역 세부 정보 */}
                <div className="mt-0.5 text-[9px] text-text-sub/80 font-bold space-y-0.5 border-t border-border/20 pt-2">
                  <div className="flex justify-between">
                    <span>최근</span>
                    <span>{item.lastDate}</span>
                  </div>
                  {dDayInfo?.nextDueDate && (
                    <div className="flex justify-between text-text-main/70">
                      <span>다음</span>
                      <span>{dDayInfo.nextDueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
