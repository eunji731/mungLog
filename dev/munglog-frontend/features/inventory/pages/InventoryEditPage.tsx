'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft, Camera, Sparkles, Star, Calendar,
  Tag, Type, Briefcase, Plus, Minus, Package,
  Activity, Thermometer, Flame, Coins, Ruler, Layers,
  Search, X, Save, ArrowLeft
} from 'lucide-react';
import { useInventory, InventoryItem } from '../hooks/useInventory';
import { useToast } from '@/app/common/hooks/useToast';
import { usePet } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/lib/clientApi';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

export default function InventoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { items, loading: listLoading, updateItem, fetchItems } = useInventory();
  const { success, error, info } = useToast();
  const { pets } = usePet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIds, setPhotoIds] = useState<(string | null)[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);

  // Form States
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
  const [petId, setPetId] = useState<string | null>(null);

  const applyItemData = useCallback((item: InventoryItem) => {
    setName(item.name || '');
    setCategory(item.category || 'ETC');
    setBrand(item.brand || '');
    setFlavor(item.flavor || '');
    setProductionDate(item.productionDate || '');
    setExpiryDateText(item.expiryDateText || '');
    setExpiryDateSpecific(item.expiryDateSpecific || '');
    setIngredients(item.ingredients || []);
    setMaterial(item.material || '');
    setSize(item.size || '');
    setStorageMethod(item.storageMethod || 'ROOM_TEMP');
    setSuggestedUsage(item.suggestedUsage || '');
    setPrice(item.price?.toString() || '');
    setStock(item.stock || 0);
    setRating(item.rating || 5);
    setIsFeeding(item.isFeeding || false);
    setOpenedAt(item.openedAt || '');
    setPetId(item.petId ?? null);

    if (item.photos && item.photos.length > 0) {
      setPhotos(item.photos.map(p => getImagePath(p.url)));
      setPhotoIds(item.photos.map(p => p.id));
    } else if (item.photo) {
      setPhotos([getImagePath(item.photo)]);
      setPhotoIds([null]);
    }
    setDeletedPhotoIds([]);
    setPhotoFiles([]);
  }, []);

  // Ensure list is loaded
  useEffect(() => {
    if (items.length === 0 && !listLoading) {
      fetchItems();
    }
  }, [items.length, listLoading, fetchItems]);

  // Handle data loading
  useEffect(() => {
    const initData = async () => {
      if (!id || !isLoading) return;

      // Find in store first (Zustand makes this potentially instant)
      const found = items.find(i => String(i.id) === String(id));
      if (found) {
        applyItemData(found);
        setIsLoading(false);
        return;
      }

      // If not in store and list loading is done, try individual API fallback
      if (!listLoading) {
        try {
          const res = await apiClient.get(`/inventory/${id}`);
          if (res.data) {
            applyItemData(res.data);
            setIsLoading(false);
          } else {
            throw new Error('Not found');
          }
        } catch (err) {
          console.error('Failed to load item', err);
          error('아이템 정보를 불러오는데 실패했습니다.');
          router.push('/inventory');
        }
      }
    };

    initData();
  }, [id, items, listLoading, applyItemData, error, router, isLoading]);

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
      setPhotoIds(prev => [...prev, ...newFiles.map(() => null)]);
      setPhotoFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const removedId = photoIds[index];
    if (removedId) {
      setDeletedPhotoIds(prev => [...prev, removedId]);
    }
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoIds(prev => prev.filter((_, i) => i !== index));
    // photoFiles는 null-id(새 파일)만 포함 → 새 파일 인덱스 계산 필요
    const newFileIndex = photoIds.slice(0, index).filter(id => id === null).length;
    if (removedId === null) {
      setPhotoFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const triggerSmartScan = async () => {
    if (photoFiles.length === 0) {
      error('분석할 새로운 사진이 없습니다.');
      return;
    }

    setIsScanning(true);

    try {
      const formData = new FormData();
      photoFiles.forEach(file => formData.append('images', file));

      const response = await apiClient.post('/ai/analyze-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      const r = response.data;
      if (r) {
        const pick = <T,>(field: { value: T | null; confidence: number } | null | undefined, threshold: number, fallback: T): T => {
          if (!field) return fallback;
          return field.confidence >= threshold && field.value !== null && field.value !== undefined ? field.value : fallback;
        };
        setCategory(pick(r.category, 0.7, category));
        setName(pick(r.name, 0.75, name));
        setBrand(pick(r.brand, 0.7, brand));
        setFlavor(pick(r.flavor, 0.7, flavor));
        setProductionDate(pick(r.productionDate, 0.8, productionDate));
        setExpiryDateSpecific(pick(r.expiryDateSpecific, 0.8, expiryDateSpecific));
        setExpiryDateText(pick(r.expiryDateText, 0.7, expiryDateText));
        setIngredients(pick(r.ingredients, 0.65, ingredients));
        setMaterial(pick(r.material, 0.7, material));
        setSize(pick(r.size, 0.7, size));
        setStorageMethod(pick(r.storageMethod, 0, storageMethod));
        setSuggestedUsage(pick(r.suggestedUsage, 0.65, suggestedUsage));
      }

      success('AI 분석 완료! 정보를 확인해 주세요.');
    } catch (err: any) {
      error('AI 분석에 실패했습니다.');
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
        deletedFileIds: deletedPhotoIds,
      };
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      const res = await apiClient.patch(`/inventory/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data) {
        updateItem(res.data);
      }

      success('수정이 완료되었습니다! ✨');
      router.push('/inventory');
    } catch (err) {
      error('수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const isConsumable = ['FOOD', 'SNACK', 'HEALTH'].includes(category);

  if (isLoading && listLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center">
        <Spinner color="yellow" className="mb-4" />
        <p className="text-text-sub text-xs font-bold animate-pulse">정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <form id="edit-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6 pb-24">

          {/* Header */}
          <header className="space-y-4">
            {/* Back Button & Actions */}
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
                <button
                  type="submit"
                  form="edit-form"
                  disabled={isLoading}
                  className="px-6 py-2.5 h-[40px] text-xs font-black rounded-xl bg-main-yellow text-white shadow-[0_4px_20px_rgba(245,188,68,0.15)] hover:bg-main-yellow/90 hover:shadow-[0_6px_25px_rgba(245,188,68,0.25)] transition-all duration-300 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  저장
                </button>
              </div>
            </div>

            {/* Hero Title Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-light-yellow/20 via-background to-light-yellow/15 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-border p-6 md:p-8 rounded-[32px] shadow-xs">
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
                  </div>

                  <h1 className="text-3xl md:text-4xl font-black text-text-main leading-[1.2] lg:leading-[1.1] tracking-tight pr-4 break-keep">
                    {name || '새 제품'}<span className="text-main-yellow">.</span>
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Photo, Basic Info, Detailed Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Photo Section */}
              <Section
                title="제품 사진"
                description="제품의 상태나 브랜드 식별을 위해 사진을 등록해 주세요."
                rightElement={photoFiles.length > 0 && !isScanning && (
                  <button
                    type="button"
                    onClick={triggerSmartScan}
                    className="bg-light-yellow/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-black text-main-yellow hover:bg-light-yellow transition-colors border border-main-yellow/20"
                  >
                    <Sparkles className="w-3 h-3" /> 새 사진으로 AI 재분석
                  </button>
                )}
              >
                <div className="grid grid-cols-3 gap-4">
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
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors z-10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-text-sub/50" />
                          <span className="text-[11px] font-black text-text-sub/60">
                            {idx === 0 ? '대표 사진 등록' : '추가 사진'}
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
                  <div className="mt-4 py-6 flex flex-col items-center justify-center text-center space-y-3 bg-surface-green/10 rounded-2xl border border-main-yellow/20 animate-pulse">
                    <Spinner size="sm" color="yellow" />
                    <p className="text-xs font-black text-main-yellow">새로운 사진 정보를 분석하고 있습니다...</p>
                  </div>
                )}
              </Section>

              {/* 기본 정보 */}
              <Section title="기본 정보" description="제품의 기본 브랜드와 카테고리를 입력하세요." overflowVisible={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="제품명 *"
                      placeholder="제품 이름을 입력해 주세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="브랜드"
                      placeholder="브랜드명"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>
                  <Select
                    label="카테고리"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
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
              <Section title="상세 정보" description="보관방법 및 규격 등 제품의 상세한 스펙을 작성하세요." overflowVisible={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isConsumable ? (
                    <>
                      <Input
                        label="맛/풍미"
                        placeholder="예: 닭가슴살, 연어, 오리"
                        value={flavor}
                        onChange={(e) => setFlavor(e.target.value)}
                      />
                      <Select
                        label="보관방법"
                        value={storageMethod}
                        onChange={(e) => setStorageMethod(e.target.value as 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN')}
                        options={[
                          { label: '상온보관', value: 'ROOM_TEMP' },
                          { label: '냉장보관', value: 'REFRIGERATED' },
                          { label: '냉동보관', value: 'FROZEN' }
                        ]}
                      />
                      <Input
                        label="제조일"
                        type="date"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                      />
                      <Input
                        label="용량/크기"
                        placeholder="예: 120g, 1kg"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
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
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1">주요 성분</label>
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
                              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl font-bold text-xs outline-none focus:border-main-yellow"
                            />
                            <button type="button" onClick={addIngredient} className="px-4 py-2.5 bg-main-yellow text-white rounded-xl font-black shadow-md hover:scale-105 active:scale-95 transition-all text-xs">+</button>
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
              {/* 아이 선택 */}
              {pets.length > 0 && (
                <Section title="아이 선택" description="어떤 아이의 제품인지 선택해 주세요.">
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
                        <p className="text-[11px] text-text-sub font-bold leading-normal mt-0.5">지급 중인 제품은 홈 화면에서 빠르게 기록할 수 있습니다.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setIsFeeding(!isFeeding)} className={`w-14 h-8 rounded-full relative transition-all shadow-inner shrink-0 ${isFeeding ? 'bg-main-green' : 'bg-border'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-background rounded-full transition-all shadow-md ${isFeeding ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-text-sub uppercase tracking-wider ml-1 flex items-center gap-1.5"><Star className="w-4 h-4 text-main-yellow fill-main-yellow" /> 아이의 선호도</label>
                    <div className="flex gap-3 py-2.5 px-4 bg-surface-green/10 rounded-xl justify-center items-center border border-border">
                      <div className="flex gap-2 animate-in fade-in duration-300">
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
            </div>
          </div>

          <div className="pt-6 flex justify-center border-t border-border">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-sm h-[48px] text-[14px] font-black rounded-2xl bg-main-yellow hover:bg-main-yellow/90 border-transparent text-white shadow-md shadow-main-yellow/10 active:scale-[0.98]"
            >
              {isLoading ? '수정 중...' : '정보 수정 완료'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

