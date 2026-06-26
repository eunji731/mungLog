'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft, Camera, Sparkles, Star, Calendar,
  Tag, Type, Briefcase, Plus, Minus, Package,
  Activity, Thermometer, Flame, Coins, Ruler, Layers,
  Search, Wand2, X, AlertCircle, PenLine, ArrowLeft
} from 'lucide-react';
import { useInventory, InventoryItem } from '@/app/common/hooks/useInventory';
import { useToast } from '@/app/common/hooks/useToast';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/app/common/lib/clientApi';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

type RegistrationMode = 'SELECT' | 'AI' | 'MANUAL';

export default function InventoryRegisterPage() {
  const router = useRouter();
  const { addItem } = useInventory();
  const { success, error, info } = useToast();
  const { pets, selectedPetId } = usePet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('SELECT');
  const [isScanning, setIsScanning] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [showForm, setShowForm] = useState(false);

  // AI Editable Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('ETC');
  const [brand, setBrand] = useState('');
  const [flavor, setFlavor] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [expiryDateText, setExpiryDateText] = useState('');
  const [expiryDateSpecific, setExpiryDateSpecific] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  const [storageMethod, setStorageMethod] = useState<'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN'>('ROOM_TEMP');
  const [suggestedUsage, setSuggestedUsage] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(1);
  const [packCount, setPackCount] = useState(1);
  const [unitsPerPack, setUnitsPerPack] = useState(1);
  const [rating, setRating] = useState(5);
  const [isFeeding, setIsFeeding] = useState(false);
  const [openedAt, setOpenedAt] = useState('');
  const [petId, setPetId] = useState<string | null>(
    selectedPetId && selectedPetId !== ALL_PETS_ID ? selectedPetId : null
  );

  const handlePhotoClick = () => {
    if (photos.length >= 3) {
      info('사진은 최대 3장까지 등록 가능합니다.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).slice(0, 3 - photos.length);
      const newPhotos = newFiles.map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
      setPhotoFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [aiCandidates, setAiCandidates] = useState<Record<string, string[]>>({});
  const [aiReviewFields, setAiReviewFields] = useState<string[]>([]);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);

  const pick = <T,>(field: { value: T | null; confidence: number } | null | undefined, threshold: number, fallback: T): T => {
    if (!field) return fallback;
    return field.confidence >= threshold && field.value !== null && field.value !== undefined
      ? field.value
      : fallback;
  };

  const triggerSmartScan = async () => {
    if (photoFiles.length === 0) {
      error('최소 1장의 사진을 등록해주세요.');
      return;
    }

    setIsScanning(true);
    setShowForm(false);

    try {
      const formData = new FormData();
      photoFiles.forEach(file => formData.append('images', file));

      const response = await apiClient.post('/ai/analyze-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      const r = response.data;
      if (r) {
        setCategory(pick(r.category, 0.7, 'ETC'));
        setName(pick(r.name, 0.75, ''));
        setBrand(pick(r.brand, 0.7, ''));
        setFlavor(pick(r.flavor, 0.7, ''));
        setProductionDate(pick(r.productionDate, 0.8, ''));
        setExpiryDateSpecific(pick(r.expiryDateSpecific, 0.8, ''));
        setExpiryDateText(pick(r.expiryDateText, 0.7, ''));
        setIngredients(pick(r.ingredients, 0.65, []));
        setMaterial(pick(r.material, 0.7, ''));
        setSize(pick(r.size, 0.7, ''));
        setStorageMethod(pick(r.storageMethod, 0, 'ROOM_TEMP'));
        setSuggestedUsage(pick(r.suggestedUsage, 0.65, ''));

        const candidates: Record<string, string[]> = {};
        const stringFields = ['name', 'brand', 'flavor', 'category', 'size', 'material', 'suggestedUsage', 'expiryDateText'] as const;
        stringFields.forEach(key => {
          const field = r[key];
          if (field?.candidates?.length) candidates[key] = field.candidates.filter(Boolean);
        });
        setAiCandidates(candidates);
        setAiReviewFields(r.reviewFields ?? []);
        setAiWarnings(r.warnings ?? []);
      }

      success(`${photoFiles.length > 1 ? '멀티 사진 분석' : '사진 분석'} 완료!`);
      setShowForm(true);
    } catch (err: any) {
      const status = err.response?.status;
      const errorCode = err.response?.data?.errorCode;
      if (status === 429 || errorCode === 'AI_DAILY_LIMIT_EXCEEDED') {
        error('오늘의 AI 분석 한도(10회)를 모두 사용했습니다. 내일 다시 시도해주세요.');
      } else if (status === 408 || err.code === 'ECONNABORTED') {
        error('AI 분석 시간이 초과되었습니다. 다시 시도해주세요.');
      } else {
        error('AI 분석에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return error('제품 이름을 입력해주세요.');

    try {
      const formData = new FormData();

      photoFiles.forEach(file => formData.append('images', file));

      const data = {
        name, category, brand, flavor: flavor || null,
        productionDate: productionDate || null,
        expiryDateText: expiryDateText || null,
        expiryDateSpecific: expiryDateSpecific || null,
        openedAt: openedAt || null,
        ingredients, material, size, storageMethod,
        suggestedUsage: suggestedUsage || null,
        price: price ? parseInt(price) : null,
        stock, rating, isFeeding,
        petId: petId || null,
      };
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      const res = await apiClient.post('/inventory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdItem = res.data;
      if (createdItem) {
        addItem(createdItem);
      } else {
        const newItem: InventoryItem = {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          name, category, brand,
          productionDate, expiryDateText, expiryDateSpecific,
          openedAt, ingredients, material, size, storageMethod,
          suggestedUsage: suggestedUsage || undefined,
          price: price ? parseInt(price) : undefined,
          stock, rating, isFeeding,
          photo: photos[0] || '',
          photos: photos.map((url, i) => ({ id: String(i), url })),
          addedAt: new Date().toISOString().split('T')[0]
        };
        addItem(newItem);
      }

      success('등록이 완료되었습니다! 🎁');
      router.push('/inventory');
    } catch (err) {
      error('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const isConsumable = ['FOOD', 'SNACK', 'HEALTH'].includes(category);

  const resetMode = () => {
    setRegistrationMode('SELECT');
    setShowForm(false);
    setPhotos([]);
    setPhotoFiles([]);
    setAiCandidates({});
    setAiReviewFields([]);
    setAiWarnings([]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        {registrationMode === 'SELECT' && (
          <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
            {/* Header */}
            <header className="space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => router.push('/inventory')} 
                  className="flex items-center gap-2 text-text-sub hover:text-text-main text-[13px] font-black transition-all group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>목록으로 돌아가기</span>
                </button>
                <div className="flex gap-2 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => router.push('/inventory')} 
                    className="px-4 py-2 text-xs font-bold text-text-sub hover:text-foreground hover:bg-surface-green rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>

              {/* Hero Title Section */}
              <div className="relative overflow-hidden bg-gradient-to-r from-main-yellow/12 via-background to-main-green/12 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-border p-6 md:p-8 rounded-[32px] shadow-xs">
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 bg-main-yellow/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-main-green/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-main-yellow/30 text-main-yellow bg-main-yellow/5">
                        등록 방식 선택
                      </span>
                      <span className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-main-green/30 text-main-green bg-main-green/5">
                        STEP 01
                      </span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-black text-text-main leading-[1.2] tracking-tight pr-4 break-keep">
                      보물창고에 새 제품을<br className="md:hidden" /> 어떻게 등록할까요?
                    </h1>
                    <p className="text-xs md:text-sm font-bold text-text-sub leading-relaxed max-w-none">
                      사진 한 장으로 간편하게 정보를 추출하는 <span className="text-main-yellow font-black">AI 스마트 등록</span>과 직접 모든 정보를 입력하는 <span className="text-main-green font-black">직접 입력</span> 방식 중 선택해 주세요.
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Selection Content */}
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setRegistrationMode('AI')}
                  className="group flex flex-col items-center gap-4 p-8 bg-background rounded-2xl border border-border hover:border-main-yellow hover:shadow-lg hover:shadow-main-yellow/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-main-yellow/10 flex items-center justify-center group-hover:bg-main-yellow/20 transition-colors">
                    <Wand2 className="w-8 h-8 text-main-yellow" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black text-text-main mb-1">AI 스마트 등록</p>
                    <p className="text-xs font-bold text-text-sub leading-normal">
                      사진을 찍으면 AI가 제품명·성분·유통기한을<br />자동으로 채워드려요.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-main-yellow/10 rounded-full">
                    <Sparkles className="w-3 h-3 text-main-yellow" />
                    <span className="text-[10px] font-black text-main-yellow">하루 10회 한도</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setRegistrationMode('MANUAL'); setShowForm(true); }}
                  className="group flex flex-col items-center gap-4 p-8 bg-background rounded-2xl border border-border hover:border-main-green hover:shadow-lg hover:shadow-main-green/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-main-green/10 flex items-center justify-center group-hover:bg-main-green/20 transition-colors">
                    <PenLine className="w-8 h-8 text-main-green" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black text-text-main mb-1">직접 입력</p>
                    <p className="text-xs font-bold text-text-sub leading-normal">
                      AI 없이 직접 정보를 입력해요.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-main-green/10 rounded-full">
                    <Package className="w-3 h-3 text-main-green" />
                    <span className="text-[10px] font-black text-main-green">제한 없이 바로 등록</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`max-w-6xl mx-auto space-y-6 pb-24 ${registrationMode === 'SELECT' ? 'hidden' : ''}`}>
          <header className="space-y-4">
            <div className="flex items-center justify-between">
              <button 
                type="button" 
                onClick={resetMode}
                className="flex items-center gap-2 text-text-sub hover:text-text-main text-[13px] font-black transition-all group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>이전 단계로</span>
              </button>
              {showForm && (
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={resetMode} className="px-4 py-2 text-xs font-bold text-text-sub hover:text-foreground hover:bg-surface-green rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer">취소</button>
                  <button type="submit" className="px-6 py-2.5 h-[40px] text-xs font-black rounded-xl bg-main-yellow text-white shadow-[0_4px_20px_rgba(245,188,68,0.15)] hover:bg-main-yellow/90 transition-all duration-300 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5">등록</button>
                </div>
              )}
            </div>

            {showForm ? (
              <div className="relative overflow-hidden bg-gradient-to-r from-light-yellow/20 via-background to-light-yellow/15 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-border p-6 md:p-8 rounded-[32px] shadow-xs animate-in fade-in duration-300">
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 bg-main-yellow/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-main-yellow/30 text-main-yellow bg-main-yellow/5">
                        {category === 'FOOD' ? '사료' :
                         category === 'SNACK' ? '간식' :
                         category === 'TOY' ? '장난감' :
                         category === 'HEALTH' ? '영양제' :
                         category === 'CLOTHES' ? '의류' : '기타'}
                      </span>
                      {registrationMode === 'AI' ? (
                        <span className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg bg-main-green/10 text-main-green border border-main-green/20">AI 분석됨</span>
                      ) : null}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-text-main leading-[1.2] lg:leading-[1.1] tracking-tight pr-4 break-keep">{name || '새 제품'}<span className="text-main-yellow">.</span></h1>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden bg-gradient-to-r from-light-yellow/20 via-background to-light-yellow/15 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-border p-6 md:p-8 rounded-[32px] shadow-xs">
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 bg-main-yellow/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border border-main-yellow/30 text-main-yellow bg-main-yellow/5">
                        스마트 분석
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-text-main leading-[1.2] lg:leading-[1.1] tracking-tight pr-4 break-keep">AI 스마트 등록<span className="text-main-yellow">.</span></h1>
                  </div>
                </div>
              </div>
            )}
          </header>

          {!showForm ? (
            <div className="w-full">
              <Section 
                title="제품 사진" 
                description={registrationMode === 'AI' ? "AI 분석을 위해 제품 앞/뒷면 사진을 등록해 주세요. (최대 3장)" : "사진은 선택 사항이에요. 없어도 등록할 수 있습니다."}
              >
                {registrationMode === 'AI' && (
                  <div className="mb-4 space-y-3">
                    <div className="bg-light-yellow/50 p-4 rounded-2xl border border-main-yellow/20 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-main-yellow shrink-0 mt-0.5" />
                      <div className="text-xs font-bold text-text-sub leading-normal">
                        <span className="text-text-main font-black">AI 인식 팁:</span> 사료나 간식은 <span className="text-main-yellow font-black">제품 앞면(브랜드/이름)</span>과 <span className="text-main-yellow font-black">뒷면(성분표/유통기한)</span> 사진을 모두 올려주시면 훨씬 정확하게 자동 입력됩니다.
                      </div>
                    </div>
                    <div className="bg-background/60 p-3 rounded-xl border border-border flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <p className="text-[10px] font-bold text-text-sub">
                        AI 분석 시작 시 저장 여부와 관계없이 일일 한도가 차감됩니다.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      onClick={photos[idx] ? undefined : handlePhotoClick}
                      className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-1.5 ${
                        photos[idx] ? 'border-main-yellow bg-background shadow-md' : 'border-border bg-surface-green/5 hover:border-main-yellow/50 cursor-pointer'
                      }`}
                    >
                      {photos[idx] ? (
                        <>
                          <Image src={photos[idx]} alt={`Product ${idx + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-text-sub/50" />
                          <span className="text-[11px] font-black text-text-sub/60">
                            {idx === 0 ? '앞면 사진' : idx === 1 ? '뒷면 사진' : '추가 사진'}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />

                {registrationMode === 'AI' && !isScanning && (
                  <button
                    type="button"
                    onClick={triggerSmartScan}
                    disabled={photos.length === 0}
                    className="w-full py-4 bg-main-yellow text-white font-black rounded-xl shadow-md shadow-main-yellow/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" /> AI 분석 시작하기
                  </button>
                )}

                {isScanning && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 bg-surface-green/10 rounded-2xl border border-main-yellow/20 animate-pulse">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-light-yellow border-t-main-yellow rounded-full animate-spin" />
                      <Search className="absolute inset-0 m-auto w-5 h-5 text-main-yellow" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-text-main mb-0.5">사진 정보를 분석하는 중...</h3>
                      <p className="text-text-sub text-[11px] font-bold">브랜드명, 제품명, 제조일 및 주요 성분을 추출하고 있습니다.</p>
                    </div>
                  </div>
                )}
              </Section>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {registrationMode === 'AI' ? (
                <div className="flex justify-center my-2">
                  <div className="bg-main-green text-white px-5 py-2 rounded-full font-black text-sm shadow-md flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>분석 완료! 아래 정보를 검토해 주세요.</span>
                  </div>
                </div>
              ) : null}

              {registrationMode === 'AI' && aiWarnings.length > 0 ? (
                <div className="space-y-1.5">
                  {aiWarnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      {w}
                    </div>
                  ))}
                </div>
              ) : null}

              {registrationMode === 'AI' && aiReviewFields.length > 0 ? (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span>AI 확인 필요 항목: <span className="font-black">{aiReviewFields.join(', ')}</span></span>
                </div>
              ) : null}

              {/* 2-column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Photo, Basic Info, Detailed Info */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Photo Section */}
                  <Section 
                    title="제품 사진" 
                    description="추가 사진 등록이나 재분석이 가능합니다."
                    rightElement={registrationMode === 'AI' && photoFiles.length > 0 && !isScanning && (
                      <button 
                        type="button"
                        onClick={triggerSmartScan}
                        className="bg-light-yellow/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-black text-main-yellow hover:bg-light-yellow transition-colors border border-main-yellow/20 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> 새 사진으로 AI 재분석
                      </button>
                    )}
                  >
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[0, 1, 2].map((idx) => (
                        <div
                          key={idx}
                          onClick={photos[idx] ? undefined : handlePhotoClick}
                          className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-1.5 ${
                            photos[idx] ? 'border-main-yellow bg-background shadow-md' : 'border-border bg-surface-green/5 hover:border-main-yellow/50 cursor-pointer'
                          }`}
                        >
                          {photos[idx] ? (
                            <>
                              <Image src={photos[idx]} alt={`Product ${idx + 1}`} fill className="object-cover" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-text-sub/50" />
                              <span className="text-[11px] font-black text-text-sub/60">
                                {idx === 0 ? '앞면 사진' : idx === 1 ? '뒷면 사진' : '추가 사진'}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    {isScanning && (
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 bg-surface-green/10 rounded-2xl border border-main-yellow/20 animate-pulse">
                        <div className="w-8 h-8 border-4 border-light-yellow border-t-main-yellow rounded-full animate-spin" />
                        <p className="text-xs font-black text-main-yellow">새로운 사진 정보를 분석하고 있습니다...</p>
                      </div>
                    )}
                  </Section>

                  {/* 기본 정보 */}
                  <Section title="기본 정보" description="제품의 기본 브랜드와 카테고리를 입력하세요.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input 
                          label="제품명 *" 
                          placeholder="제품 이름을 입력해 주세요" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                        />
                        {aiCandidates.name?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                            <span className="text-[10px] font-black text-text-sub self-center">AI 후보:</span>
                            {aiCandidates.name.map((c, i) => (
                              <button key={i} type="button" onClick={() => setName(c)}
                                className="px-2.5 py-1 text-xs font-black bg-background border border-main-yellow/40 text-main-yellow rounded-full hover:bg-main-yellow hover:text-white transition-all cursor-pointer">
                                {c}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <Input 
                          label="브랜드" 
                          placeholder="브랜드명" 
                          value={brand} 
                          onChange={(e) => setBrand(e.target.value)} 
                        />
                        {aiCandidates.brand?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                            <span className="text-[10px] font-black text-text-sub self-center">AI 후보:</span>
                            {aiCandidates.brand.map((c, i) => (
                              <button key={i} type="button" onClick={() => setBrand(c)}
                                className="px-2.5 py-1 text-xs font-black bg-background border border-main-yellow/40 text-main-yellow rounded-full hover:bg-main-yellow hover:text-white transition-all cursor-pointer">
                                {c}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <Select 
                        label="카테고리" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value as any)} 
                        options={[
                          { label: '사료', value: 'FOOD' },
                          { label: '간식', value: 'SNACK' },
                          { label: '장난감', value: 'TOY' },
                          { label: '영양제', value: 'HEALTH' },
                          { label: '의류', value: 'CLOTHES' },
                          { label: '기타', value: 'ETC' }
                        ]}
                      />
                    </div>
                  </Section>

                  {/* 상세 정보 */}
                  <Section title="상세 정보" description="보관방법 및 규격 등 제품의 상세한 스펙을 작성하세요.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isConsumable ? (
                        <>
                          <div>
                            <Input 
                              label="맛/풍미" 
                              placeholder="예: 닭가슴살, 연어, 오리" 
                              value={flavor} 
                              onChange={(e) => setFlavor(e.target.value)} 
                            />
                            {aiCandidates.flavor?.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                                <span className="text-[10px] font-black text-text-sub self-center">AI 후보:</span>
                                {aiCandidates.flavor.map((c, i) => (
                                  <button key={i} type="button" onClick={() => setFlavor(c)}
                                    className="px-2.5 py-1 text-xs font-black bg-background border border-main-yellow/40 text-main-yellow rounded-full hover:bg-main-yellow hover:text-white transition-all cursor-pointer">
                                    {c}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <Input 
                            label="제조일" 
                            type="date"
                            value={productionDate} 
                            onChange={(e) => setProductionDate(e.target.value)} 
                          />

                          <Input 
                            label="유통기한 (날짜)" 
                            type="date"
                            value={expiryDateSpecific} 
                            onChange={(e) => setExpiryDateSpecific(e.target.value)} 
                          />

                          <Input 
                            label="유통기한 문구" 
                            placeholder="예: 제조일로부터 18개월" 
                            value={expiryDateText} 
                            onChange={(e) => setExpiryDateText(e.target.value)} 
                          />

                          <div>
                            <Input 
                              label="용량/크기" 
                              placeholder="예: 120g, 1kg" 
                              value={size} 
                              onChange={(e) => setSize(e.target.value)} 
                            />
                            {aiCandidates.size?.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                                <span className="text-[10px] font-black text-text-sub self-center">AI 후보:</span>
                                {aiCandidates.size.map((c, i) => (
                                  <button key={i} type="button" onClick={() => setSize(c)}
                                    className="px-2.5 py-1 text-xs font-black bg-background border border-main-yellow/40 text-main-yellow rounded-full hover:bg-main-yellow hover:text-white transition-all cursor-pointer">
                                    {c}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <Select 
                            label="보관방법" 
                            value={storageMethod} 
                            onChange={(e) => setStorageMethod(e.target.value as any)} 
                            options={[
                              { label: '상온보관', value: 'ROOM_TEMP' },
                              { label: '냉장보관', value: 'REFRIGERATED' },
                              { label: '냉동보관', value: 'FROZEN' }
                            ]}
                          />

                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">주요 성분 (뒷면 분석)</label>
                            <div className="flex flex-wrap gap-2 mb-2 p-4 bg-surface-green/10 rounded-2xl border border-border">
                              {ingredients.map((ing, i) => (
                                <span key={i} className="px-3.5 py-1.5 bg-background border border-border rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm text-text-main">
                                  {ing} 
                                  <button type="button" onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 font-bold ml-1">×</button>
                                </span>
                              ))}
                              <div className="flex gap-2 w-full mt-2">
                                <input 
                                  type="text" 
                                  value={ingredientInput} 
                                  onChange={(e) => setIngredientInput(e.target.value)} 
                                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())} 
                                  placeholder="성분 직접 추가" 
                                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl font-bold text-sm outline-none focus:border-main-yellow" 
                                />
                                <button type="button" onClick={addIngredient} className="px-4 py-2.5 bg-main-yellow text-white rounded-xl font-black shadow-md text-xs">+</button>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">급여/사용 방법</label>
                            <textarea 
                              value={suggestedUsage} 
                              onChange={(e) => setSuggestedUsage(e.target.value)} 
                              placeholder="예: 체중 5kg 기준 하루 2~3개..." 
                              rows={3} 
                              className="w-full px-5 py-3.5 bg-background border border-border rounded-xl font-bold text-[15px] focus:border-main-yellow transition-all outline-none resize-none leading-relaxed shadow-sm text-foreground placeholder:text-text-sub/50" 
                            />
                            {aiCandidates.suggestedUsage?.length > 0 ? (
                              <div className="space-y-1.5 mt-2 px-1">
                                <span className="text-[10px] font-black text-text-sub">AI 후보:</span>
                                {aiCandidates.suggestedUsage.map((c, i) => (
                                  <button key={i} type="button" onClick={() => setSuggestedUsage(c)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-bold bg-background border border-main-yellow/40 text-text-main rounded-xl hover:border-main-yellow hover:bg-light-yellow/30 transition-all leading-relaxed cursor-pointer">
                                    {c}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <>
                          <Input 
                            label="사이즈" 
                            placeholder="M, 25cm 등" 
                            value={size} 
                            onChange={(e) => setSize(e.target.value)} 
                          />
                          <Input 
                            label="재질" 
                            placeholder="면 100%, 고무 등" 
                            value={material} 
                            onChange={(e) => setMaterial(e.target.value)} 
                          />
                        </>
                      )}
                    </div>
                  </Section>
                </div>

                {/* Right Column: Pet Select, Management */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 반려견 선택 */}
                  {pets.length > 0 && (
                    <Section title="반려견 선택" description="어떤 아이의 제품인지 선택해 주세요.">
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPetId(null)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                            petId === null
                              ? 'bg-main-yellow/10 border-main-yellow text-main-yellow'
                              : 'bg-background border-border text-text-sub hover:border-main-yellow/40'
                          }`}
                        >
                          공용 (전체)
                        </button>
                        {pets.map(pet => (
                          <button
                            key={pet.id}
                            type="button"
                            onClick={() => setPetId(pet.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                              petId === pet.id
                                ? 'bg-main-yellow/10 border-main-yellow text-main-yellow'
                                : 'bg-background border-border text-text-sub hover:border-main-yellow/40'
                            }`}
                          >
                            {pet.photo ? (
                              <Image
                                src={getImagePath(pet.photo)}
                                alt={pet.name}
                                width={20}
                                height={20}
                                className="rounded-full object-cover w-5 h-5"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-main-yellow/20 flex items-center justify-center text-[9px] font-black text-main-yellow">
                                {pet.name[0]}
                              </div>
                            )}
                            {pet.name}
                          </button>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* 관리 설정 */}
                  <Section title="관리 설정" description="구매 가격, 수량 및 지급 상태와 아이의 선호도를 설정합니다.">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="w-full space-y-2 text-left">
                        <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">구매 가격</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            placeholder="0" 
                            className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-border focus:border-main-yellow focus:ring-4 focus:ring-main-yellow/5 bg-background text-[15px] font-medium outline-none transition-all text-right text-foreground placeholder:text-text-sub/50 shadow-sm" 
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-text-sub text-[14px]">원</span>
                        </div>
                      </div>

                      <div className="w-full space-y-2 text-left">
                        <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">보유 수량 (낱개 기준)</label>
                        <div className="flex items-center justify-between px-5 py-2.5 bg-surface-green/10 rounded-xl border border-border shadow-sm">
                          <button type="button" onClick={() => setStock(Math.max(0, stock - 1))} className="w-9 h-9 rounded-lg bg-background border border-border shadow-sm flex items-center justify-center hover:bg-red-50 transition-all active:scale-90"><Minus className="w-4 h-4 text-text-main" /></button>
                          <span className="text-xl font-black text-text-main">{stock}</span>
                          <button type="button" onClick={() => setStock(stock + 1)} className="w-9 h-9 rounded-lg bg-background border border-border shadow-sm flex items-center justify-center hover:bg-green-50 transition-all active:scale-90"><Plus className="w-4 h-4 text-text-main" /></button>
                        </div>
                        <p className="text-[10px] text-text-sub font-bold px-1 leading-normal">하트가드처럼 1팩에 여러 개가 들어있다면, 팩 수가 아니라 낱개 총량을 입력해야 일정 완료 시 정확히 차감돼요.</p>

                        <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-green/5 rounded-xl border border-dashed border-border mt-2">
                          <input
                            type="number"
                            min={0}
                            value={packCount}
                            onChange={(e) => setPackCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 px-1.5 py-1 bg-background border border-border rounded-lg font-black text-center text-xs outline-none focus:border-main-yellow"
                          />
                          <span className="text-[10px] font-bold text-text-sub shrink-0">팩 ×</span>
                          <input
                            type="number"
                            min={0}
                            value={unitsPerPack}
                            onChange={(e) => setUnitsPerPack(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 px-1.5 py-1 bg-background border border-border rounded-lg font-black text-center text-xs outline-none focus:border-main-yellow"
                          />
                          <span className="text-[10px] font-bold text-text-sub shrink-0">개입 =</span>
                          <button
                            type="button"
                            onClick={() => setStock(packCount * unitsPerPack)}
                            className="flex-1 py-1 bg-main-yellow hover:bg-main-yellow/90 text-white text-[10px] font-black rounded-lg shadow-sm active:scale-95 transition-all"
                          >
                            {packCount * unitsPerPack}개 적용
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-surface-green/5 rounded-2xl flex items-center justify-between border border-border">
                        <div className="flex gap-4 items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFeeding ? 'bg-main-green text-white shadow-md' : 'bg-background text-text-sub border border-border'}`}><Activity className="w-5 h-5" /></div>
                          <div>
                            <p className="font-black text-text-main text-sm">현재 급여/사용 중</p>
                            <p className="text-[11px] text-text-sub font-bold leading-normal mt-0.5">이 제품은 홈 화면과 타임라인에서 빠르게 기록할 수 있습니다.</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setIsFeeding(!isFeeding)} className={`w-14 h-8 rounded-full relative transition-all shadow-inner shrink-0 ${isFeeding ? 'bg-main-green' : 'bg-border'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-background rounded-full transition-all shadow-md ${isFeeding ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1 flex items-center gap-1.5"><Star className="w-4 h-4 text-main-yellow fill-main-yellow" /> 우리 아이 선호도</label>
                        <div className="flex gap-3 py-2.5 px-4 bg-surface-green/10 rounded-xl justify-center items-center border border-border">
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} type="button" onClick={() => setRating(s)} className="p-0.5 transition-all hover:scale-110 active:scale-90">
                                <Star className={`w-6 h-6 ${s <= rating ? 'text-main-yellow fill-main-yellow' : 'text-border fill-border'}`} />
                              </button>
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-black text-main-yellow shrink-0">{rating}점</span>
                        </div>
                      </div>
                    </div>
                  </Section>
                </div> {/* Right Column (lg:col-span-7) */}
              </div> {/* Grid (grid-cols-12) */}
              <div className="pt-6 flex justify-center border-t border-border">
                <Button 
                  type="submit" 
                  className="w-full max-w-sm h-[48px] text-[14px] font-black rounded-2xl bg-main-yellow hover:bg-main-yellow/90 border-transparent text-white shadow-md shadow-main-yellow/10 active:scale-[0.98] cursor-pointer"
                >
                  보물창고에 등록하기
                </Button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
