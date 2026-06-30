'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ShieldCheck, AlertCircle, Dog, Calendar, Heart, Sparkles, Scale, Shield } from 'lucide-react';
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
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const rotateX = -(y - box.height / 2) / (box.height / 2) * 10;
    const rotateY = (x - box.width / 2) / (box.width / 2) * 10;
    
    setRotate({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / box.width) * 100,
      y: (y / box.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const age = calculateAge(pet.birthDate);
  const formattedRegNum = formatRegNumber(pet.registrationNumber);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* CSS Styles for Shimmer & Floating Animations */}
      <style>{`
        @keyframes card-shimmer {
          0% { transform: translateX(-150%) rotate(25deg); }
          100% { transform: translateX(150%) rotate(25deg); }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-card-shimmer {
          animation: card-shimmer 4s infinite linear;
        }
        .animate-card-float {
          animation: card-float 5s ease-in-out infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Main Container - max-w-lg로 확장 (가로 너비 증가) */}
      <div className="relative w-full max-w-lg animate-in zoom-in-95 fade-in duration-300 max-h-[92vh] overflow-y-auto no-scrollbar rounded-3xl bg-background shadow-2xl border border-border/80 overflow-hidden">
        
        {/* ── 실물 카드 비주얼 영역 ── */}
        <div className="relative bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 px-6 pt-12 pb-10 flex flex-col items-center justify-center border-b border-border/50 overflow-hidden">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-text-sub shadow-sm border border-border/40 hover:scale-105 transition-all z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Sparkles / Hologram blur deco */}
          <div className="absolute -left-16 -top-16 w-36 h-36 rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-teal-500/10 dark:bg-teal-400/5 blur-3xl pointer-events-none" />

          {/* Interactive 3D Card Wrapper - max-w-[440px]로 확장 */}
          <div className="w-full max-w-[440px] animate-card-float relative z-10">
            {/* Realistic ID Card */}
            <div
              className="relative w-full aspect-[1.58/1] rounded-2xl p-6 text-white shadow-[0_20px_45px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden select-none bg-gradient-to-br from-emerald-600 via-teal-700 to-zinc-900 cursor-pointer transition-all duration-300"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Dynamic Glare Effect */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)`,
                  opacity: glare.opacity,
                }}
              />

              {/* Holographic Fine Line overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Gold Shimmer Reflection Line */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -inset-y-12 -left-1/2 w-[20%] bg-gradient-to-r from-transparent via-white/15 to-transparent animate-card-shimmer transform origin-top-left" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center border border-white/10 shrink-0">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-emerald-100 uppercase">MungLog Certified</span>
                </div>
                <span className="text-[10px] font-black tracking-widest text-white/80">REPUBLIC OF KOREA</span>
              </div>

              {/* Card Body Grid */}
              <div className="flex gap-5 items-start relative z-10">
                {/* Photo container - 사진 사이즈도 밸런스에 맞추어 확대 */}
                <div className="relative w-[96px] h-[116px] rounded-xl overflow-hidden border border-white/30 bg-zinc-800/40 shadow-inner shrink-0">
                  <Image
                    src={getImagePath(pet.photo, 'profiles')}
                    alt={pet.name}
                    fill
                    className="object-cover"
                  />
                  {/* Photo holographic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-pink-400/10 mix-blend-overlay" />
                </div>

                {/* Identity Information */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black tracking-tight text-white truncate drop-shadow-md">{pet.name}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-black text-white ${pet.gender === 'MALE' ? 'bg-blue-500/70 border border-blue-400/30' : 'bg-pink-500/70 border border-pink-400/30'}`}>
                      {pet.gender === 'MALE' ? '남아' : '여아'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-medium text-emerald-50/90 leading-tight">
                    <p className="truncate"><span className="text-emerald-200/60 font-bold mr-2 uppercase text-[10px] tracking-wider">Breed</span>{pet.breed || '품종 미입력'}</p>
                    <p className="truncate"><span className="text-emerald-200/60 font-bold mr-2 uppercase text-[10px] tracking-wider">Birth</span>{pet.birthDate || '생일 미입력'}</p>
                    {age && <p className="truncate"><span className="text-emerald-200/60 font-bold mr-2 uppercase text-[10px] tracking-wider">Age</span>{age}</p>}
                  </div>

                  {/* Gold IC Chip - 크기 소폭 확대 */}
                  <div className="w-10 h-7.5 rounded bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 relative overflow-hidden border border-amber-500/40 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-800/30" />
                    <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-800/30" />
                    <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-800/30" />
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-full border-x border-amber-800/30" />
                  </div>
                </div>
              </div>

              {/* Barcode & Holographic Seal at Bottom */}
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                {formattedRegNum ? (
                  <div className="flex flex-col gap-0.5">
                    {/* 바코드 세로 높이 확대 */}
                    <div className="h-8 flex items-end gap-[1.5px] opacity-70">
                      {Array.from({ length: 32 }).map((_, i) => {
                        const w = [1, 2, 1, 3, 2, 1, 4, 1, 2, 3][i % 10];
                        return (
                          <div
                            key={i}
                            className="bg-white"
                            style={{ width: `${w}px`, height: `${16 + (i % 3) * 4}px` }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[12px] font-mono font-black tracking-[0.18em] text-white/95 drop-shadow-sm">{formattedRegNum}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-white/30" />
                    <span>미등록 반려동물 (No Reg Num)</span>
                  </div>
                )}

                {/* Metallic Hologram Seal - 크기 확대 */}
                <div className="w-12 h-12 rounded-full border border-white/20 bg-gradient-to-tr from-pink-400/20 via-cyan-400/20 to-yellow-400/20 backdrop-blur-[2px] flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white/50" />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── 상세 정보 영역 (Scrollable) ── */}
        <div className="px-6 py-6 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">

          {/* ── 등록번호 경고/안내 배너 ── */}
          {!formattedRegNum && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl px-5 py-4">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-normal">
                동물등록번호가 아직 등록되지 않았습니다.<br />
                <span className="font-medium text-amber-700/80 dark:text-amber-400/70">정보 수정을 통해 번호를 입력할 수 있습니다.</span>
              </p>
            </div>
          )}

          {/* ── 상세 정보 그리드 (2x3) ── */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCell label="품종" value={pet.breed || '정보 없음'} icon={Dog} />
            <InfoCell label="성별" value={pet.gender === 'MALE' ? '수컷' : pet.gender === 'FEMALE' ? '암컷' : '정보 없음'} icon={Heart} />
            <InfoCell label="생년월일" value={pet.birthDate || '정보 없음'} icon={Calendar} />
            <InfoCell label="나이" value={age ?? '정보 없음'} icon={Sparkles} />
            <InfoCell label="체중" value={pet.weightKg ? `${pet.weightKg} kg` : '정보 없음'} icon={Scale} />
            <InfoCell label="중성화" value="정보 없음" icon={Shield} />
          </div>

          {/* ── 보호자 정보 ── */}
          {user && (
            <div className="border-t border-border/60 pt-5 space-y-3">
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">보호자 정보 (Guardian)</p>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl px-5 py-4 border border-zinc-100 dark:border-zinc-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                {user.profileImageUrl ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-zinc-800 shadow-sm">
                    <Image src={user.profileImageUrl} alt={user.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 border border-emerald-200/30">
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{user.name.charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{user.name}</p>
                  {user.email && <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">{user.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── 예방접종 기록 ── */}
          <div className="border-t border-border/60 pt-5">
            <VaccinationSection petId={pet.id} />
          </div>

          {/* ── 첨부파일 ── */}
          <div className="border-t border-border/60 pt-5">
            <PetDocumentSection petId={pet.id} />
          </div>

        </div>
      </div>
    </div>
  );
};

/** 상세 정보 셀 */
interface InfoCellProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const InfoCell: React.FC<InfoCellProps> = ({ label, value, icon: Icon }) => (
  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-900/80">
    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 border border-emerald-100/20">
      <Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 truncate">{value}</p>
    </div>
  </div>
);

export default RegistrationCardModal;
