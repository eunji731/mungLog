'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Sparkles, User, Heart, Info, X, Calendar, TrendingUp, IdCard, ShieldCheck } from 'lucide-react';
import { usePet, PetProfile, PetFormData } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/lib/clientApi';
import { useToast } from '@/app/common/hooks/useToast';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploader } from '@/components/common/FileUploader';
import TimelineDatePicker from '@/features/calendar/components/TimelineDatePicker';
import RegistrationCardModal from '@/features/family/components/RegistrationCardModal';
import PetDocumentSection from '@/features/family/components/PetDocumentSection';

export default function FamilyPage() {
  const { pets, addPet, updatePet, removePet, loading } = usePet();
  const { success, error: toastError, warning } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [viewingPet, setViewingPet] = useState<PetProfile | null>(null);
  const [registrationModalPetId, setRegistrationModalPetId] = useState<string | null>(null);

  // New/Edit Pet Form State
  const [newName, setNewName] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newAdoptionDate, setNewAdoptionDate] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [newWeightKg, setNewWeightKg] = useState('');
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [newTraits, setNewTraits] = useState('');
  const [newAppearance, setNewAppearance] = useState('');
  const [newLikes, setNewLikes] = useState('');
  const [newDislikes, setNewDislikes] = useState('');
  const [newDiaryTone, setNewDiaryTone] = useState('');
  const profilePhoto = useFileUpload('DOG');

  const handleEditClick = (e: React.MouseEvent, pet: PetProfile) => {
    e.stopPropagation();
    setEditingPetId(pet.id);
    setNewName(pet.name);
    setNewBreed(pet.breed);
    setNewBirthDate(pet.birthDate);
    setNewAdoptionDate(pet.adoptionDate || '');
    setNewGender(pet.gender);
    setNewWeightKg(pet.weightKg?.toString() || '');
    setNewRegistrationNumber(pet.registrationNumber || '');
    setNewTraits(pet.traits);
    setNewAppearance(pet.appearance || '');
    setNewLikes(pet.likes || '');
    setNewDislikes(pet.dislikes || '');
    setNewDiaryTone(pet.diaryTone || '');

    const photoFileName = pet.photo ? (pet.photo.split('/').pop() || 'profile.jpg') : 'profile.jpg';
    profilePhoto.setInitialFiles(
      pet.photo ? [{
        id: `existing-${pet.id}`,
        originalFileName: photoFileName,
        storedFileName: photoFileName,
        fileUrl: pet.photo,
        fileSize: 0,
        fileType: 'image/jpeg',
        targetType: 'DOG',
        targetId: pet.id,
        createdAt: '',
      }] : []
    );
    setIsAdding(true);
    setViewingPet(null);
  };

  const handleSavePet = async () => {
    if (!newName.trim()) {
      warning('아이의 이름을 입력해 주세요.');
      return;
    }
    if (!newBreed.trim()) {
      warning('견종을 입력해 주세요.');
      return;
    }
    if (!newBirthDate) {
      warning('아이의 생일을 선택해 주세요.');
      return;
    }

    const petData: PetFormData = {
      name: newName,
      breed: newBreed,
      birthDate: newBirthDate,
      adoptionDate: newAdoptionDate || undefined,
      gender: newGender,
      weightKg: newWeightKg ? parseFloat(newWeightKg) : undefined,
      registrationNumber: newRegistrationNumber.trim() || undefined,
      traits: newTraits,
      appearance: newAppearance || undefined,
      likes: newLikes || undefined,
      dislikes: newDislikes || undefined,
      diaryTone: newDiaryTone || undefined,
    };

    try {
      const newFile = profilePhoto.localFiles[0] ?? null;
      if (editingPetId) {
        await updatePet(editingPetId, petData, newFile);
        success(`${newName}의 정보가 수정되었습니다! ✨`);
      } else {
        await addPet(petData, newFile);
        success(`${newName}가 우리 가족으로 등록되었습니다! 🐶`);
      }
      resetForm();
    } catch (err) {
      toastError(editingPetId ? '정보 수정에 실패했습니다.' : '반려동물 등록에 실패했습니다.');
    }
  };

  const handleOpenRegistrationModal = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    setRegistrationModalPetId(petId);
  };

  const handleRemovePet = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    try {
      await removePet(id);
      success(`${name} 프로필이 삭제되었습니다.`);
      if (viewingPet?.id === id) setViewingPet(null);
    } catch (err) {
      toastError('프로필 삭제에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingPetId(null);
    setNewName('');
    setNewBreed('');
    setNewBirthDate('');
    setNewAdoptionDate('');
    setNewGender('MALE');
    setNewWeightKg('');
    setNewRegistrationNumber('');
    setNewTraits('');
    setNewAppearance('');
    setNewLikes('');
    setNewDislikes('');
    setNewDiaryTone('');
    profilePhoto.clear();
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '정보 없음';
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return '정보 없음';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age}세` : '1세 미만';
  };

  const modernInputClass = "w-full px-4 py-3 bg-zinc-50 border border-border/80 rounded-xl focus:bg-background focus:border-main-green focus:ring-2 focus:ring-main-green/10 text-sm font-medium text-text-main placeholder:text-text-sub/30 transition-all outline-none";
  const modernLabelClass = "text-xs font-semibold text-text-main/85 tracking-wide block mb-2";

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50/50 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-border shrink-0">
        <div className="w-full px-4 md:px-10 h-12 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 bg-main-green/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-main-green" />
            </div>
            <h1 className="text-sm font-black tracking-tight whitespace-nowrap">
              우리 가족<span className="text-main-green"> 관리</span>
            </h1>
          </div>

          {!isAdding && !viewingPet && (
            <button
              onClick={() => {
                resetForm();
                setViewingPet(null);
                setIsAdding(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-main-green text-white font-black rounded-xl text-xs shadow-md shadow-main-green/20 hover:scale-105 active:scale-95 transition-all animate-in fade-in"
            >
              <Plus className="w-4 h-4" /> 아이 추가하기
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">

          {/* 1) Add/Edit Pet Form */}
          {isAdding && (
            <div className="bg-background rounded-2xl border border-border/80 shadow-sm p-6 lg:p-10 space-y-8 animate-in fade-in duration-300">

              <div className="flex justify-between items-center border-b border-border pb-4 mb-2">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-bold text-text-main tracking-tight">
                    {editingPetId ? '아이 정보 수정' : '새로운 가족 등록'}
                  </h2>
                  <span className="text-[10px] font-medium text-text-sub hidden sm:inline">AI 프로필 정보를 입력해 주세요.</span>
                </div>
                <button onClick={resetForm} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-all">
                  <X className="w-4 h-4 text-text-sub" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/60 items-start">

                {/* Column 1: Photo */}
                <div className="pb-6 lg:pb-0 lg:pr-8 flex flex-col items-center justify-center space-y-5">
                  <div className="w-full flex flex-col items-center gap-4 py-2">
                    <span className={modernLabelClass}>프로필 사진</span>
                    <FileUploader
                      variant="profile"
                      mode="single"
                      fileInfos={profilePhoto.fileInfos}
                      onFileSelect={(files) => profilePhoto.handleSelect(files, 1)}
                      onFileDelete={profilePhoto.handleDelete}
                      loading={profilePhoto.isUploading}
                      maxCount={1}
                      accept="image/*"
                      isCircle={true}
                    />
                  </div>

                  <div className="w-full space-y-1">
                    <label className={modernLabelClass}>일기 말투</label>
                    <input
                      type="text" value={newDiaryTone} onChange={e => setNewDiaryTone(e.target.value)}
                      placeholder="예: 발랄하게, 정중하게"
                      className={modernInputClass}
                    />
                  </div>
                </div>

                {/* Column 2: Core Info */}
                <div className="py-6 lg:py-0 lg:px-8 space-y-5">
                  <div className="space-y-1">
                    <label className={modernLabelClass}>이름 *</label>
                    <input
                      type="text" value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="이름"
                      className={modernInputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={modernLabelClass}>견종 *</label>
                    <input
                      type="text" value={newBreed} onChange={e => setNewBreed(e.target.value)}
                      placeholder="견종"
                      className={modernInputClass}
                    />
                  </div>

                  <TimelineDatePicker
                    value={newBirthDate}
                    onChange={(date) => setNewBirthDate(date)}
                    label="생일 *"
                    variant="form"
                  />

                  <TimelineDatePicker
                    value={newAdoptionDate}
                    onChange={(date) => setNewAdoptionDate(date)}
                    label="입양일"
                    variant="form"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={modernLabelClass}>성별</label>
                      <div className="flex bg-zinc-50 border border-border/80 rounded-xl p-1 h-[46px] items-center">
                        <button
                          type="button"
                          onClick={() => setNewGender('MALE')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newGender === 'MALE' ? 'bg-background text-main-green border border-border/30 shadow-sm font-extrabold' : 'text-text-sub'}`}
                        >
                          남아
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewGender('FEMALE')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${newGender === 'FEMALE' ? 'bg-background text-main-green border border-border/30 shadow-sm font-extrabold' : 'text-text-sub'}`}
                        >
                          여아
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className={modernLabelClass}>몸무게 (kg)</label>
                      <input
                        type="number" step="0.01" value={newWeightKg} onChange={e => setNewWeightKg(e.target.value)}
                        placeholder="0.00"
                        className={modernInputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={modernLabelClass}>동물등록번호</label>
                    <input
                      type="text"
                      value={newRegistrationNumber}
                      onChange={e => setNewRegistrationNumber(e.target.value)}
                      placeholder="예: 410181234500001"
                      maxLength={15}
                      className={modernInputClass}
                    />
                  </div>
                </div>

                {/* Column 3: Traits */}
                <div className="pt-6 lg:pt-0 lg:pl-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={modernLabelClass}>좋아하는 것</label>
                      <input
                        type="text" value={newLikes} onChange={e => setNewLikes(e.target.value)}
                        placeholder="간식, 장난감 등"
                        className={modernInputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={modernLabelClass}>싫어하는 것</label>
                      <input
                        type="text" value={newDislikes} onChange={e => setNewDislikes(e.target.value)}
                        placeholder="행동, 소리 등"
                        className={modernInputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={modernLabelClass}>외형적 특징</label>
                    <input
                      type="text" value={newAppearance} onChange={e => setNewAppearance(e.target.value)}
                      placeholder="예: 귀가 접혀있음, 곱슬털"
                      className={modernInputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-main-green/80 tracking-widest uppercase flex items-center justify-between">
                      <span>성격 및 특징 (AI 참고용)</span>
                      <div className="group relative">
                        <Info className="w-3.5 h-3.5 text-text-sub/60 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-text-main text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed normal-case font-normal">
                          여기에 입력한 정보가 AI 일기 작성 시 반영됩니다. 평소 행동 습관을 적어주면 더 생생한 일기를 써드려요!
                        </div>
                      </div>
                    </label>
                    <textarea
                      rows={2} value={newTraits} onChange={e => setNewTraits(e.target.value)}
                      placeholder="아이의 성격을 자세히 적어주세요. AI가 더 똑똑해집니다."
                      className="w-full px-3.5 py-2.5 bg-zinc-50/50 border border-zinc-200/80 rounded-xl focus:bg-background focus:border-main-green focus:ring-1 focus:ring-main-green/10 text-xs font-semibold text-text-main placeholder:text-text-sub/30 resize-none transition-all outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border/60">
                <button onClick={resetForm} className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-xs transition-all">취소</button>
                <button
                  onClick={handleSavePet}
                  disabled={loading}
                  className="px-10 py-2.5 bg-main-green text-white font-bold rounded-xl shadow-md shadow-main-green/10 hover:bg-main-green/90 active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
                >
                  {loading ? '처리 중...' : (editingPetId ? '수정하기' : '등록하기')}
                </button>
              </div>

            </div>
          )}

          {/* 2) Viewing Pet Detail */}
          {viewingPet && (
            <div className="bg-background rounded-2xl border border-border/80 shadow-sm p-6 lg:p-10 space-y-8 animate-in fade-in duration-300">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border pb-6">
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border/80 bg-zinc-50 shrink-0">
                    <Image src={getImagePath(viewingPet.photo, 'profiles')} alt={viewingPet.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3.5 mb-1.5">
                      <h2 className="text-2xl font-black text-text-main tracking-tight">{viewingPet.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${viewingPet.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {viewingPet.gender === 'MALE' ? '남아' : '여아'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-text-sub">{viewingPet.breed} · {calculateAge(viewingPet.birthDate)} ({viewingPet.birthDate} 생)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:flex gap-2.5 w-full sm:w-auto self-stretch sm:self-auto shrink-0">
                  <button
                    onClick={(e) => handleOpenRegistrationModal(e, viewingPet.id)}
                    className="px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30 font-black rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95"
                  >
                    <IdCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 동물등록증
                  </button>
                  <button
                    onClick={(e) => handleEditClick(e, viewingPet)}
                    className="px-4 py-2.5 bg-main-green hover:bg-main-green/90 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm shadow-main-green/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 정보 수정
                  </button>
                  <button
                    onClick={(e) => handleRemovePet(e, viewingPet.id, viewingPet.name)}
                    className="px-4 py-2.5 bg-background border border-red-200 text-red-500 hover:bg-red-50 font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 삭제
                  </button>
                  <button
                    onClick={() => setViewingPet(null)}
                    className="p-2.5 bg-zinc-50 hover:bg-zinc-100 text-text-sub rounded-xl border border-border/60 transition-all shrink-0 col-span-3 sm:col-span-1 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/60">

                <div className="pb-8 lg:pb-0 lg:pr-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 border border-border/40 rounded-xl">
                      <div className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> 생일
                      </div>
                      <div className="text-sm font-black text-text-main">{viewingPet.birthDate}</div>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-border/40 rounded-xl">
                      <div className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> 입양일
                      </div>
                      <div className="text-sm font-black text-text-main">{viewingPet.adoptionDate || '정보 없음'}</div>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-border/40 rounded-xl">
                      <div className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> 몸무게
                      </div>
                      <div className="text-sm font-black text-text-main">{viewingPet.weightKg ? `${viewingPet.weightKg}kg` : '정보 없음'}</div>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-border/40 rounded-xl">
                      <div className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 일기 말투
                      </div>
                      <div className="text-sm font-black text-text-main">{viewingPet.diaryTone || '기본 설정'}</div>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-border/40 rounded-xl col-span-2 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black text-main-green uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" /> 동물등록번호
                        </div>
                        <div className="text-base font-black text-text-main tracking-wider">{viewingPet.registrationNumber || '정보 없음'}</div>
                      </div>
                      <button
                        onClick={(e) => handleOpenRegistrationModal(e, viewingPet.id)}
                        className="px-3 py-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-[11px] font-black transition-all shadow-sm shrink-0 active:scale-95"
                      >
                        등록증 보기
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-main-green tracking-widest uppercase">성격 및 특징</h4>
                    <div className="p-5 bg-zinc-50/50 border border-border/60 rounded-xl italic leading-relaxed text-sm font-medium text-text-main/80">
                      &quot;{viewingPet.traits || '등록된 특징이 없습니다.'}&quot;
                    </div>
                  </div>
                </div>

                <div className="pt-8 lg:pt-0 lg:pl-10 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-main-green tracking-widest uppercase">좋아하고 싫어하는 것</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 font-black">Like</div>
                        <p className="text-sm font-bold text-text-main leading-relaxed mt-1">{viewingPet.likes || '정보 없음'}</p>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-pink-50/50 dark:bg-pink-900/10 rounded-xl border border-pink-100/50 dark:border-pink-900/20">
                        <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 font-black">Hate</div>
                        <p className="text-sm font-bold text-text-main leading-relaxed mt-1">{viewingPet.dislikes || '정보 없음'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-main-green tracking-widest uppercase">외형적 특징</h4>
                    <div className="p-5 bg-zinc-50/50 border border-border/60 rounded-xl text-sm font-bold text-text-main leading-relaxed">
                      {viewingPet.appearance || '정보 없음'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 첨부파일 */}
              <div className="border-t border-border pt-6">
                <PetDocumentSection petId={viewingPet.id} />
              </div>

            </div>
          )}

          {/* 3) Pet List */}
          {!isAdding && !viewingPet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {pets.map(pet => (
                <div
                  key={pet.id}
                  onClick={() => {
                    setViewingPet(pet);
                    setIsAdding(false);
                  }}
                  className="group bg-background rounded-2xl border border-border/80 p-6 flex items-start gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* 프로필 이미지 */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md shrink-0 bg-zinc-100">
                    <Image src={getImagePath(pet.photo, 'profiles')} alt={pet.name} fill className="object-cover" />
                  </div>

                  {/* 본문 전체 영역 (가로 꽉 차게 w-full flex-1) */}
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    {/* 첫째 줄: 이름/성별/액션(좌)과 동물등록증 버튼(우측 끝 정렬) */}
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-xl font-black text-text-main truncate">{pet.name}</h3>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black text-white ${pet.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {pet.gender === 'MALE' ? '남아' : '여아'}
                        </span>
                        
                        {/* 수정 / 삭제 미니 버튼 그룹 (성별 뱃지 바로 옆으로 이동, 호버 시 은은하게 노출) */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shrink-0 ml-1">
                          <button
                            onClick={(e) => handleRemovePet(e, pet.id, pet.name)}
                            className="p-1.5 text-text-sub hover:text-red-500 hover:bg-zinc-50 rounded-lg shrink-0 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, pet)}
                            className="p-1.5 text-text-sub hover:text-main-green hover:bg-zinc-50 rounded-lg shrink-0 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* 동물등록증 버튼 (우측 상단 끝 정렬) */}
                        <button
                          onClick={(e) => handleOpenRegistrationModal(e, pet.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-black tracking-tight transition-all shadow-sm hover:shadow active:scale-95 shrink-0"
                        >
                          <IdCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">동물등록증</span>
                          {pet.registrationNumber ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 둘째 줄: 품종 및 생년월일 */}
                    <div className="text-xs font-bold text-text-sub">
                      {pet.breed} · {calculateAge(pet.birthDate)} ({pet.birthDate})
                      {pet.weightKg && ` · ${pet.weightKg}kg`}
                    </div>

                    {/* 셋째 줄: 특징 (우측 정렬선과 완벽히 맞추어 꽉 참) */}
                    <div className="bg-zinc-50 p-3 rounded-xl border border-border/60 w-full">
                      <p className="text-[11px] text-text-sub font-medium line-clamp-2 italic leading-relaxed">
                        &quot;{pet.traits || '등록된 특징이 없습니다. AI를 위해 입력해 주세요!'}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {pets.length === 0 && (
                <div className="md:col-span-2 py-20 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-main-green/10 rounded-full flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-main-green" />
                  </div>
                  <h3 className="text-xl font-black text-text-main">등록된 가족이 없어요</h3>
                  <p className="text-text-sub mt-2 font-medium">우리 아이의 정보를 먼저 등록해 주세요!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 동물등록증 모달 */}
      {registrationModalPetId && (() => {
        const modalPet = pets.find(p => p.id === registrationModalPetId);
        if (!modalPet) return null;
        return (
          <RegistrationCardModal
            pet={modalPet}
            onClose={() => setRegistrationModalPetId(null)}
          />
        );
      })()}

    </div>
  );
}
