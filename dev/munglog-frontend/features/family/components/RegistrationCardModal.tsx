'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { PetProfile } from '@/app/common/hooks/usePet';
import { useAuth } from '@/context/AuthContext';
import { getImagePath } from '@/lib/clientApi';
import VaccinationSection from './VaccinationSection';
import PetDocumentSection from './PetDocumentSection';

interface RegistrationCardModalProps {
  pet: PetProfile;
  onClose: () => void;
}

const RegistrationCardModal: React.FC<RegistrationCardModalProps> = ({ pet, onClose }) => {
  const { user } = useAuth();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? `${age}세` : '1세 미만';
  };

  const formatRegNumber = (num?: string) => {
    if (!num) return null;
    // 410181234500001 → 410-18-1234500001
    if (num.length === 15) return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
    return num;
  };

  const age = calculateAge(pet.birthDate);
  const formattedRegNum = formatRegNumber(pet.registrationNumber);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">

          {/* ── 헤더 ── */}
          <div className="relative bg-main-green/8 border-b border-border px-6 pt-6 pb-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-main-green" />
                <span className="text-[11px] font-black text-main-green tracking-widest uppercase">Animal Registration</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-text-sub transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">동물등록증</h2>
          </div>

          <div className="px-6 py-6 space-y-6">

            {/* ── 등록번호 ── */}
            {formattedRegNum ? (
              <div className="bg-main-green/5 border border-main-green/20 rounded-2xl px-5 py-4 text-center">
                <p className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1.5">등록번호</p>
                <p className="text-2xl font-black text-foreground tracking-widest tabular-nums">{formattedRegNum}</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-zinc-50 border border-border rounded-2xl px-5 py-4">
                <AlertCircle className="w-4 h-4 text-text-sub shrink-0" />
                <p className="text-sm font-bold text-text-sub">등록번호가 아직 등록되지 않았습니다.</p>
              </div>
            )}

            {/* ── 동물 정보 ── */}
            <div className="flex gap-4 items-start">
              {/* 프로필 이미지 */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-zinc-100 shrink-0">
                <Image
                  src={getImagePath(pet.photo, 'profiles')}
                  alt={pet.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* 이름 + 기본 정보 */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-foreground truncate">{pet.name}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black text-white ${pet.gender === 'MALE' ? 'bg-blue-500' : pet.gender === 'FEMALE' ? 'bg-pink-500' : 'bg-zinc-400'}`}>
                    {pet.gender === 'MALE' ? '수컷' : pet.gender === 'FEMALE' ? '암컷' : '미확인'}
                  </span>
                </div>
                <p className="text-sm font-bold text-text-sub">{pet.breed || '품종 미입력'}</p>
                {age && (
                  <p className="text-xs font-medium text-text-sub">
                    {pet.birthDate} · {age}
                  </p>
                )}
              </div>
            </div>

            {/* ── 상세 정보 그리드 ── */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCell label="품종" value={pet.breed || '정보 없음'} />
              <InfoCell label="성별" value={pet.gender === 'MALE' ? '수컷' : pet.gender === 'FEMALE' ? '암컷' : '정보 없음'} />
              <InfoCell label="생년월일" value={pet.birthDate || '정보 없음'} />
              <InfoCell label="나이" value={age ?? '정보 없음'} />
              <InfoCell label="체중" value={pet.weightKg ? `${pet.weightKg} kg` : '정보 없음'} />
              <InfoCell label="중성화" value="정보 없음" />
            </div>

            {/* ── 보호자 정보 ── */}
            {user && (
              <div className="border-t border-border pt-5 space-y-2">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">보호자 정보</p>
                <div className="flex items-center gap-3 bg-zinc-50 rounded-xl px-4 py-3 border border-border/60">
                  {user.profileImageUrl ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border">
                      <Image src={user.profileImageUrl} alt={user.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-main-green/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-main-green">{user.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-black text-foreground">{user.name}</p>
                    {user.email && <p className="text-[11px] text-text-sub font-medium">{user.email}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── 예방접종 기록 ── */}
            <VaccinationSection petId={pet.id} />

            {/* ── 첨부파일 ── */}
            <PetDocumentSection petId={pet.id} />

          </div>
        </div>
      </div>
    </div>
  );
};

/** 상세 정보 셀 */
const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-zinc-50 border border-border/60 rounded-xl px-4 py-3">
    <p className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-foreground">{value}</p>
  </div>
);

export default RegistrationCardModal;
