'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import { vaccinationTypeApi } from '@/api/vaccinationTypeApi';
import type { VaccinationType, VaccinationAliasMatch } from '@/types/vaccination';

interface VaccinationTypeSelectorProps {
  types: VaccinationType[];
  value: number | null;
  inputTitle: string;
  onChange: (typeId: number | null, typeName: string) => void;
  onInputTitleChange: (title: string) => void;
  onCreateType: (name: string, intervalDays?: number | null) => Promise<VaccinationType>;
}

const VaccinationTypeSelector: React.FC<VaccinationTypeSelectorProps> = ({
  types, value, inputTitle, onChange, onInputTitleChange, onCreateType,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [aliasMatches, setAliasMatches] = useState<VaccinationAliasMatch[]>([]);
  const [isMatchingAlias, setIsMatchingAlias] = useState(false);
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeInterval, setNewTypeInterval] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedType = types.find(t => t.id === value) ?? null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTypes = types.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleTitleBlur = async () => {
    const q = inputTitle.trim();
    if (!q || value !== null) return;
    setIsMatchingAlias(true);
    try {
      const matches = await vaccinationTypeApi.matchAlias(q);
      setAliasMatches(matches);
      if (matches.length === 1) {
        onChange(matches[0].vaccinationTypeId, matches[0].vaccinationTypeName);
        setAliasMatches([]);
      }
    } catch {
      // 조용히 무시
    } finally {
      setIsMatchingAlias(false);
    }
  };

  const handleSelectType = (type: VaccinationType) => {
    onChange(type.id, type.name);
    onInputTitleChange(type.name);
    setOpen(false);
    setSearch('');
    setAliasMatches([]);
  };

  const handleClearType = () => {
    onChange(null, '');
    setAliasMatches([]);
  };

  const handleCreateNewType = async () => {
    if (!newTypeName.trim()) return;
    setIsCreating(true);
    try {
      const intervalVal = newTypeInterval ? parseInt(newTypeInterval, 10) : null;
      const created = await onCreateType(newTypeName.trim(), intervalVal);
      onChange(created.id, created.name);
      onInputTitleChange(created.name);
      setShowNewTypeForm(false);
      setNewTypeName('');
      setNewTypeInterval('');
      setOpen(false);
    } catch {
      // 실패 시 무시
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-text-sub uppercase tracking-widest">
        접종명 *
      </label>

      <div ref={containerRef} className="relative">
        {/* 입력 + 선택 버튼 */}
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputTitle}
              onChange={e => {
                onInputTitleChange(e.target.value);
                if (value !== null) onChange(null, e.target.value);
                setAliasMatches([]);
              }}
              onBlur={handleTitleBlur}
              placeholder="예: 광견병, 종합백신"
              className="w-full px-3 py-2.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-text-sub/40 focus:border-main-green focus:ring-2 focus:ring-main-green/10 outline-none transition-all pr-8"
            />
            {isMatchingAlias && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-sub animate-pulse">
                검색 중...
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 px-3 py-2.5 bg-zinc-50 border border-border/80 rounded-xl text-xs font-bold text-text-sub hover:border-main-green hover:text-main-green transition-all shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 선택된 접종종류 뱃지 */}
        {selectedType && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-main-green/10 text-main-green text-[11px] font-black">
              {selectedType.name}
              {selectedType.intervalDays && (
                <span className="font-medium text-main-green/70">
                  · {selectedType.intervalDays >= 365
                    ? `${selectedType.intervalDays / 365}년`
                    : `${selectedType.intervalDays}일`}마다
                </span>
              )}
              <button type="button" onClick={handleClearType} className="hover:text-red-500 transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* alias 자동 매칭 안내 */}
        {aliasMatches.length > 1 && (
          <div className="mt-1.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
            <p className="text-[11px] font-bold text-amber-700">여러 접종종류와 유사합니다. 선택해 주세요:</p>
            {aliasMatches.map(m => (
              <button
                key={m.vaccinationTypeId}
                type="button"
                onClick={() => {
                  onChange(m.vaccinationTypeId, m.vaccinationTypeName);
                  onInputTitleChange(m.vaccinationTypeName);
                  setAliasMatches([]);
                }}
                className="w-full text-left px-2.5 py-1.5 bg-white border border-amber-100 rounded-lg text-xs font-bold text-foreground hover:border-main-green hover:bg-main-green/5 transition-all"
              >
                {m.vaccinationTypeName}
                {m.intervalDays && <span className="ml-1 text-text-sub font-medium">({m.intervalDays}일 주기)</span>}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAliasMatches([])}
              className="text-[10px] text-text-sub/60 hover:text-text-sub"
            >
              닫기
            </button>
          </div>
        )}

        {/* 드롭다운 */}
        {open && (
          <div className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* 검색 */}
            <div className="p-2 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-sub/50" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="접종종류 검색..."
                  autoFocus
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-zinc-50 border border-border/60 rounded-lg outline-none focus:border-main-green"
                />
              </div>
            </div>

            {/* 목록 */}
            <div className="max-h-48 overflow-y-auto">
              {filteredTypes.length === 0 ? (
                <p className="text-xs text-text-sub/60 text-center py-4">검색 결과가 없습니다.</p>
              ) : (
                filteredTypes.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectType(t)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-zinc-50 transition-all flex items-center justify-between ${
                      value === t.id ? 'bg-main-green/5 text-main-green' : 'text-foreground'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-text-sub/60 font-medium text-[10px]">
                      {t.intervalDays
                        ? (t.intervalDays >= 365 ? `${t.intervalDays / 365}년 주기` : `${t.intervalDays}일 주기`)
                        : '주기 없음'}
                      {t.isGlobal && ' · 기본'}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* 새 접종종류 추가 */}
            <div className="border-t border-border/60 p-2">
              {!showNewTypeForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setNewTypeName(search || inputTitle);
                    setShowNewTypeForm(true);
                  }}
                  className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-main-green hover:bg-main-green/5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  새 접종종류 추가
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={e => setNewTypeName(e.target.value)}
                    placeholder="접종종류 이름 *"
                    className="w-full px-2.5 py-1.5 text-xs border border-border/80 rounded-lg outline-none focus:border-main-green"
                    autoFocus
                  />
                  <input
                    type="number"
                    value={newTypeInterval}
                    onChange={e => setNewTypeInterval(e.target.value)}
                    placeholder="접종 주기 (일 단위, 예: 365)"
                    className="w-full px-2.5 py-1.5 text-xs border border-border/80 rounded-lg outline-none focus:border-main-green"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowNewTypeForm(false)}
                      className="flex-1 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-all"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewType}
                      disabled={!newTypeName.trim() || isCreating}
                      className="flex-1 py-1.5 text-xs font-bold bg-main-green text-white rounded-lg hover:bg-main-green/90 disabled:opacity-50 transition-all"
                    >
                      {isCreating ? '추가 중...' : '추가'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaccinationTypeSelector;
