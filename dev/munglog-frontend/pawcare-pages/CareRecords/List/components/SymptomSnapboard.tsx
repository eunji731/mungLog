'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Camera, Trash2, Link as LinkIcon, AlertCircle, CheckCircle2, X, ChevronDown, Check, Pencil } from 'lucide-react';
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { DatePicker } from '@/components/common/DatePicker';
import { TagInput } from '@/components/common/TagInput';
import TimelineDatePicker from '@/app/calendar/components/TimelineDatePicker';
import TimelineTimePicker from './TimelineTimePicker';
import { getImagePath } from '@/app/common/lib/clientApi';

export interface SymptomSnap {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  symptomTags: string[];
  memo: string;
  photoUrl?: string; // base64 data URL
  status: 'MONITORING' | 'RESOLVED';
  resolvedRecordId?: string;
  resolvedRecordTitle?: string;
}

const SUGGESTED_SYMPTOMS = ['구토', '설사', '긁음', '눈물', '절뚝임', '기침', '콧물', '식욕부진', '발열', '피부염', '가려움'];

interface SymptomSnapboardProps {
  timelineRecords: any[];
  onSnapLinked?: () => void;
}

export default function SymptomSnapboard({ timelineRecords, onSnapLinked }: SymptomSnapboardProps) {
  const { selectedPetId, pets } = usePet();
  const [snaps, setSnaps] = useState<SymptomSnap[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // 필터 관련 상태
  const [period, setPeriod] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // 등록 관련 상태
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDate, setRegisterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [registerTime, setRegisterTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [registerPetId, setRegisterPetId] = useState<string>('');
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const petDropdownRef = useRef<HTMLDivElement>(null);
  const [editingSnapId, setEditingSnapId] = useState<string | null>(null);

  // 연동 관련 상태
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // localStorage에서 스냅 로드
  const loadSnaps = () => {
    try {
      const data = localStorage.getItem('munglog_symptom_snaps');
      if (data) {
        const parsed = JSON.parse(data);
        const migrated = parsed.map((s: any) => {
          if (s.symptomTag && !s.symptomTags) {
            return {
              ...s,
              symptomTags: [s.symptomTag],
            };
          }
          if (!s.symptomTags) {
            return {
              ...s,
              symptomTags: ['기타'],
            };
          }
          return s;
        });
        setSnaps(migrated);
      }
    } catch (e) {
      console.error('Failed to load snaps from localStorage', e);
    }
  };

  useEffect(() => {
    loadSnaps();
    // 다른 창이나 탭에서의 업데이트 동기화
    window.addEventListener('storage', loadSnaps);
    return () => window.removeEventListener('storage', loadSnaps);
  }, []);

  // 외부 클릭으로 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (petDropdownRef.current && !petDropdownRef.current.contains(event.target as Node)) {
        setPetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 사진 업로드 -> Base64 변환
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 스냅 등록 열기
  const handleOpenRegister = () => {
    setEditingSnapId(null);
    if (selectedPetId && selectedPetId !== ALL_PETS_ID) {
      setRegisterPetId(selectedPetId);
    } else if (pets.length > 0) {
      setRegisterPetId(pets[0].id);
    } else {
      setRegisterPetId('');
    }
    setRegisterDate(format(new Date(), 'yyyy-MM-dd'));
    setRegisterTime(format(new Date(), 'HH:mm'));
    setTags([]);
    setPetDropdownOpen(false);
    setIsRegisterOpen(true);
  };

  // 스냅 수정 열기
  const handleOpenEdit = (snap: SymptomSnap) => {
    setEditingSnapId(snap.id);
    setRegisterPetId(snap.petId);
    setRegisterDate(snap.date);
    setRegisterTime(snap.time);
    setTags(snap.symptomTags || []);
    setMemo(snap.memo || '');
    setPhotoBase64(snap.photoUrl || '');
    setPhotoFileName(snap.photoUrl ? '기존 이미지' : '');
    setPetDropdownOpen(false);
    setIsRegisterOpen(true);
  };

  // 등록/수정 팝업 닫기
  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
    setEditingSnapId(null);
    setPetDropdownOpen(false);
    setRegisterDate(format(new Date(), 'yyyy-MM-dd'));
    setRegisterTime(format(new Date(), 'HH:mm'));
    setTags([]);
    setMemo('');
    setPhotoBase64('');
    setPhotoFileName('');
  };

  // 스냅 등록/수정 제출
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerPetId) {
      alert('기록 대상 아이를 선택해 주세요.');
      return;
    }

    const finalTags = tags.length > 0 ? tags : ['기타'];

    let updatedSnaps: SymptomSnap[];

    if (editingSnapId) {
      updatedSnaps = snaps.map(s => {
        if (s.id === editingSnapId) {
          return {
            ...s,
            petId: registerPetId,
            date: registerDate,
            time: registerTime,
            symptomTags: finalTags,
            memo: memo.trim(),
            photoUrl: photoBase64 || undefined,
          };
        }
        return s;
      });
    } else {
      const newSnap: SymptomSnap = {
        id: `snap_${Date.now()}`,
        petId: registerPetId,
        date: registerDate,
        time: registerTime,
        symptomTags: finalTags,
        memo: memo.trim(),
        photoUrl: photoBase64 || undefined,
        status: 'MONITORING',
      };
      updatedSnaps = [newSnap, ...snaps];
    }

    setSnaps(updatedSnaps);
    localStorage.setItem('munglog_symptom_snaps', JSON.stringify(updatedSnaps));

    handleCloseRegister();

    // 이벤트 리스너 알림 (TimelineItem 갱신 목적)
    window.dispatchEvent(new Event('symptom_snaps_updated'));
  };

  // 스냅 삭제
  const handleDeleteSnap = (id: string) => {
    if (!confirm('기록된 증상 스냅을 삭제하시겠습니까?')) return;
    const updated = snaps.filter(s => s.id !== id);
    setSnaps(updated);
    localStorage.setItem('munglog_symptom_snaps', JSON.stringify(updated));
    window.dispatchEvent(new Event('symptom_snaps_updated'));
  };

  // 스냅과 케어 기록 연동하기
  const handleLinkRecord = (snapId: string, record: any) => {
    const updated = snaps.map(s => {
      if (s.id === snapId) {
        return {
          ...s,
          status: 'RESOLVED' as const,
          resolvedRecordId: String(record.id),
          resolvedRecordTitle: record.title || '병원 진료',
        };
      }
      return s;
    });
    setSnaps(updated);
    localStorage.setItem('munglog_symptom_snaps', JSON.stringify(updated));
    setActiveLinkId(null);
    window.dispatchEvent(new Event('symptom_snaps_updated'));
    if (onSnapLinked) onSnapLinked();
  };

  // 연동 해제하기
  const handleUnlinkRecord = (snapId: string) => {
    if (!confirm('진료 연동을 해제하시겠습니까?')) return;
    const updated = snaps.map(s => {
      if (s.id === snapId) {
        return {
          ...s,
          status: 'MONITORING' as const,
          resolvedRecordId: undefined,
          resolvedRecordTitle: undefined,
        };
      }
      return s;
    });
    setSnaps(updated);
    localStorage.setItem('munglog_symptom_snaps', JSON.stringify(updated));
    window.dispatchEvent(new Event('symptom_snaps_updated'));
    if (onSnapLinked) onSnapLinked();
  };

  // 1차 필터링: 선택된 반려견 조건
  let filteredSnaps = snaps.filter(s => {
    if (selectedPetId === ALL_PETS_ID) return true; // 전체가족
    return s.petId === selectedPetId;
  });

  // 2차 필터링: 날짜 기간 조건
  const todayStart = startOfDay(new Date());
  filteredSnaps = filteredSnaps.filter(s => {
    const snapDate = parseISO(s.date);
    
    if (period === 'TODAY') {
      return s.date === format(new Date(), 'yyyy-MM-dd');
    }
    if (period === 'WEEK') {
      const weekAgo = subDays(todayStart, 7);
      return snapDate >= weekAgo;
    }
    if (period === 'MONTH') {
      const monthAgo = subDays(todayStart, 30);
      return snapDate >= monthAgo;
    }
    if (period === 'CUSTOM') {
      if (!customStartDate) return true;
      const start = startOfDay(customStartDate);
      const end = customEndDate ? endOfDay(customEndDate) : endOfDay(customStartDate);
      return isWithinInterval(snapDate, { start, end });
    }
    return true; // ALL
  });

  // 연동 가능한 최근 병원/진료 기록들 필터링
  const getLinkableRecords = () => {
    return timelineRecords.filter(r => r.recordType === 'HOSPITAL');
  };

  const hasDateFilter = period !== 'ALL';
  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedRegisterPet = pets.find(p => p.id === registerPetId);

  return (
    <div className="bg-background rounded-[32px] border border-border p-5 md:p-6 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="space-y-0.5">
          <h3 className="text-base font-black text-text-main flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-main-yellow" /> 증상 스냅보드
          </h3>
          <p className="text-[10px] text-text-sub font-bold">임시 건강 이상 관찰 일지</p>
        </div>

        {pets.length > 0 && (
          <button
            onClick={handleOpenRegister}
            className="flex items-center gap-1 px-3 py-1.5 bg-main-yellow hover:bg-main-yellow/90 text-white text-xs font-black rounded-full shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> 스냅 등록
          </button>
        )}
      </div>

      {/* Date Filter Buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-text-sub uppercase tracking-wider">조회 기간 설정</span>
          {hasDateFilter && (
            <button
              onClick={() => {
                setPeriod('ALL');
                setCustomStartDate(null);
                setCustomEndDate(null);
              }}
              className="text-[9px] font-black text-main-green hover:underline"
            >
              필터 초기화
            </button>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map(p => {
            const labelMap = { ALL: '전체', TODAY: '오늘', WEEK: '7일', MONTH: '30일' };
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  isActive 
                    ? 'bg-main-green/10 text-main-green border border-main-green/20' 
                    : 'bg-surface-green/50 text-text-sub border border-transparent hover:text-main-green'
                }`}
              >
                {labelMap[p]}
              </button>
            );
          })}

          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => {
                setPeriod('CUSTOM');
                setShowDatePicker(prev => !prev);
              }}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all border ${
                period === 'CUSTOM'
                  ? 'bg-main-green/10 text-main-green border-main-green/20'
                  : 'bg-surface-green/50 text-text-sub border-transparent hover:text-main-green'
              }`}
            >
              📅 {customStartDate ? format(customStartDate, 'MM.dd') : '날짜 지정'}
            </button>

            {showDatePicker && period === 'CUSTOM' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex-1">
                    <DatePicker
                      selected={customStartDate}
                      onChange={(date) => setCustomStartDate(date)}
                      placeholderText="시작일"
                    />
                  </div>
                  <span className="text-text-sub">~</span>
                  <div className="flex-1">
                    <DatePicker
                      selected={customEndDate}
                      onChange={(date) => setCustomEndDate(date)}
                      placeholderText="종료일"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full py-1 bg-main-green text-white text-[10px] font-bold rounded-lg"
                >
                  적용 완료
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Snap List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
        {filteredSnaps.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl bg-surface-green/10">
            <AlertCircle className="w-8 h-8 text-text-sub/30 mx-auto mb-2" />
            <p className="text-xs font-bold text-text-sub">관찰된 이상 증상이 없습니다</p>
            {selectedPetId === ALL_PETS_ID && (
              <p className="text-[10px] text-text-sub/60 mt-1">아이를 선택하면 빠른 등록이 가능합니다.</p>
            )}
          </div>
        ) : (
          filteredSnaps.map(snap => {
            const isMonitoring = snap.status === 'MONITORING';
            const petName = pets.find(p => p.id === snap.petId)?.name || '아이';

            return (
              <div
                key={snap.id}
                className={`p-3.5 border rounded-2xl transition-all shadow-sm relative overflow-hidden bg-background group ${
                  isMonitoring ? 'border-amber-100 hover:border-amber-300' : 'border-border opacity-75'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                    {(snap.symptomTags || []).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-main-green/5 text-main-green border border-main-green/20">
                        #{tag}
                      </span>
                    ))}
                    <span className="text-[10px] font-bold text-text-sub ml-1 truncate">
                      {petName} · {snap.date} {snap.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(snap)}
                      className="p-1 hover:text-main-green text-text-sub transition-colors"
                      title="수정"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSnap(snap.id)}
                      className="p-1 hover:text-red-500 text-text-sub transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Memo & Photo */}
                <div className="flex gap-3 mb-3">
                  {snap.photoUrl && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0 bg-stone-100 relative">
                      <img src={snap.photoUrl} alt={(snap.symptomTags || []).join(', ')} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-text-main leading-relaxed flex-1 break-all">
                    {snap.memo || '이상 증상이 관찰됨.'}
                  </p>
                </div>

                {/* Status & Linking Workflow */}
                <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-[11px]">
                  {isMonitoring ? (
                    <>
                      <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> 관찰 중
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveLinkId(activeLinkId === snap.id ? null : snap.id)}
                          className="flex items-center gap-1 font-black text-main-green hover:underline cursor-pointer bg-transparent border-none"
                        >
                          <LinkIcon className="w-3 h-3" /> 진료 연동
                        </button>

                        {/* Linkable Records Popover */}
                        {activeLinkId === snap.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-64 bg-background border border-border shadow-2xl rounded-2xl p-2 z-[60] max-h-52 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-2">
                            <div className="p-2 border-b border-border mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-black text-text-sub">연동할 병원 기록 선택</span>
                              <button type="button" onClick={() => setActiveLinkId(null)}>
                                <X className="w-3 h-3 text-text-sub hover:text-red-500" />
                              </button>
                            </div>

                            {getLinkableRecords().length === 0 ? (
                              <p className="text-[10px] text-text-sub text-center py-4 font-bold">
                                최근 등록된 병원 진료 기록이 없습니다.
                              </p>
                            ) : (
                              getLinkableRecords().map((record: any) => (
                                <button
                                  type="button"
                                  key={record.id}
                                  onClick={() => handleLinkRecord(snap.id, record)}
                                  className="w-full text-left p-2 hover:bg-surface-green rounded-xl transition-colors flex items-center gap-2"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-text-main truncate">{record.title}</p>
                                    <p className="text-[9px] text-text-sub font-bold mt-0.5">{record.recordDate} · {record.clinicName || '진료'}</p>
                                  </div>
                                  <Check className="w-3.5 h-3.5 text-main-green shrink-0 opacity-0 hover:opacity-100" />
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 진료 연동됨
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUnlinkRecord(snap.id)}
                        className="text-text-sub hover:text-red-500 hover:underline bg-transparent border-none"
                        title={snap.resolvedRecordTitle}
                      >
                        연동 해제
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Register Modal */}
      {isRegisterOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-md rounded-[32px] border border-border shadow-2xl overflow-visible animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-green/20 rounded-t-[32px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-main-yellow" />
                <h4 className="font-black text-sm text-text-main">
                  {editingSnapId ? '이상 증상 기록 수정' : '새로운 이상 증상 기록'}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCloseRegister}
                className="p-1 hover:bg-border rounded-lg text-text-sub transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-4">
              {/* Pet Selector (Only in ALL_PETS_ID view) */}
              {selectedPetId === ALL_PETS_ID && (
                <div className="w-full space-y-1 text-left relative" ref={petDropdownRef}>
                  <label className="text-[10px] font-black text-text-sub ml-1">
                    대상 아이
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setPetDropdownOpen(!petDropdownOpen)}
                    className={`w-full px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between shadow-sm bg-background ${
                      petDropdownOpen 
                        ? 'border-main-green ring-4 ring-main-green/5' 
                        : 'border-border hover:border-main-green/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedRegisterPet ? (
                        <>
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-green border border-border flex items-center justify-center shrink-0 shadow-sm">
                            {selectedRegisterPet.photo ? (
                              <img src={getImagePath(selectedRegisterPet.photo, 'profiles')} alt={selectedRegisterPet.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[11px]">🐶</span>
                            )}
                          </div>
                          <span className="text-xs font-black text-foreground">
                            {selectedRegisterPet.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-surface-green border border-border flex items-center justify-center shrink-0 text-text-sub shadow-sm">
                            <span className="text-[11px]">🐾</span>
                          </div>
                          <span className="text-xs font-bold text-text-sub/50">
                            아이 선택
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[8px] text-text-sub tracking-widest pl-2">
                      {petDropdownOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {petDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-[250] bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border overflow-hidden p-1.5 animate-in zoom-in-95 duration-200 origin-top">
                      <div className="max-h-[190px] overflow-y-auto no-scrollbar space-y-0.5">
                        {pets.map((dog) => {
                          const isCurrent = String(dog.id) === String(registerPetId);
                          return (
                            <button
                              key={dog.id}
                              type="button"
                              onClick={() => {
                                setRegisterPetId(dog.id);
                                setPetDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-all ${
                                isCurrent 
                                  ? 'bg-main-green text-white font-black' 
                                  : 'hover:bg-surface-green/45 text-text-main hover:text-main-green hover:translate-x-1'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${
                                isCurrent ? 'border-white/30 bg-white/20' : 'border-border bg-surface-green'
                              }`}>
                                {dog.photo ? (
                                  <img src={getImagePath(dog.photo, 'profiles')} alt={dog.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[12px]">🐶</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold leading-tight">{dog.name}</span>
                                <span className={`text-[9px] leading-tight ${isCurrent ? 'text-white/70' : 'text-text-sub/70'}`}>
                                  {dog.breed || '믹스견'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                        {pets.length === 0 && (
                          <div className="text-center py-4 text-[11px] font-bold text-text-sub">
                            등록된 반려견이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Picker using custom timeline controls */}
              <div className="grid grid-cols-2 gap-3">
                <TimelineDatePicker
                  value={registerDate}
                  onChange={(date) => setRegisterDate(date)}
                  label="발생 날짜"
                  variant="form"
                />
                <TimelineTimePicker
                  value={registerTime}
                  onChange={(time) => setRegisterTime(time)}
                  label="발생 시간"
                  variant="form"
                />
              </div>

              {/* Symptom Tag Selection using TagInput */}
              <div className="space-y-1">
                <TagInput
                  label="증상 분류"
                  tags={tags}
                  onChange={setTags}
                  suggestions={SUGGESTED_SYMPTOMS}
                  placeholder="증상 입력 후 Enter"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-sub ml-1">사진 첨부 (선택)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-border hover:border-main-green rounded-xl text-[10px] font-black text-text-sub hover:text-main-green cursor-pointer transition-all bg-stone-50/50">
                    <Camera className="w-3.5 h-3.5" /> 사진 촬영/첨부
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photoFileName && (
                    <span className="text-[9px] font-bold text-text-sub truncate max-w-[150px]" title={photoFileName}>
                      {photoFileName}
                    </span>
                  )}
                </div>
                {photoBase64 && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border mt-2 bg-stone-100">
                    <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotoBase64(''); setPhotoFileName(''); }}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Memo Text */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-sub ml-1">증상 코멘트</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 강아지가 거실 러그에 노란 토를 조금 함. 컨디션은 좋아 보임."
                  className="w-full border border-border rounded-xl p-3.5 text-[14px] font-medium text-foreground placeholder:text-text-sub/40 bg-background focus:outline-none focus:border-main-green/50 focus:ring-4 focus:ring-main-green/5 resize-none h-20 transition-all"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl text-xs"
                  onClick={handleCloseRegister}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 rounded-xl text-xs bg-main-yellow text-white border-main-yellow shadow-md shadow-main-yellow/10"
                >
                  {editingSnapId ? '수정 완료' : '기록 완료'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
