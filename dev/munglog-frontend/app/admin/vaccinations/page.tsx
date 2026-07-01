'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Check, X, PowerOff, Syringe, GitMerge, Users, Info, ArrowRight } from 'lucide-react';
import { adminVaccinationApi } from '@/api/adminVaccinationApi';
import type { VaccinationType } from '@/types/vaccination';
import { Button } from '@/components/common/Button';
import { useToast } from '@/app/common/hooks/useToast';
import { useConfirm } from '@/app/common/hooks/useConfirm';

type Tab = 'global' | 'user';

function formatInterval(days: number | null): string {
  if (!days) return '-';
  if (days % 365 === 0) return `${days / 365}년`;
  if (days % 30 === 0) return `${days / 30}개월`;
  return `${days}일`;
}

export default function VaccinationsAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [globalItems, setGlobalItems] = useState<VaccinationType[]>([]);
  const [userItems, setUserItems] = useState<VaccinationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newInterval, setNewInterval] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingInterval, setEditingInterval] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState<number | null>(null);
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [globals, users] = await Promise.all([
        adminVaccinationApi.getAll(),
        adminVaccinationApi.getUserCreatedTypes(),
      ]);
      setGlobalItems(globals);
      setUserItems(users);
    } catch {
      error('예방접종 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const parseInterval = (val: string): number | null => {
    const n = parseInt(val, 10);
    return isNaN(n) || n <= 0 ? null : n;
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await adminVaccinationApi.create({ name, intervalDays: parseInterval(newInterval) });
      success(`'${name}' 접종 종류가 추가되었습니다.`);
      setNewName('');
      setNewInterval('');
      await load();
    } catch {
      error('접종 종류 추가에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await adminVaccinationApi.update(id, { name, intervalDays: parseInterval(editingInterval) });
      success('수정되었습니다.');
      setEditingId(null);
      await load();
    } catch {
      error('수정에 실패했습니다.');
    }
  };

  const handleDeactivate = async (item: VaccinationType) => {
    const ok = await confirm(
      `'${item.name}'을(를) 비활성화하시겠습니까?\n비활성화된 접종 종류는 사용자에게 표시되지 않습니다.`
    );
    if (!ok) return;
    try {
      await adminVaccinationApi.deactivate(item.id);
      success(`'${item.name}' 비활성화되었습니다.`);
      await load();
    } catch {
      error('비활성화에 실패했습니다.');
    }
  };

  const startMerge = (sourceId: number) => {
    setMergeSourceId(sourceId);
    setActiveTab('global');
  };

  const handleMerge = async (targetId: number) => {
    if (!mergeSourceId || mergeSourceId === targetId) return;
    const source = userItems.find(i => i.id === mergeSourceId);
    const target = globalItems.find(i => i.id === targetId);
    if (!source || !target) return;
    const ok = await confirm(
      `'${source.name}'을(를) '${target.name}'으로 병합하시겠습니까?\n\n` +
      `• 사용자의 '${source.name}' 케어기록이 모두 '${target.name}'으로 이동됩니다.\n` +
      `• '${source.name}'이 '${target.name}'의 별칭으로 등록되어 향후 자동 매칭됩니다.\n` +
      `• '${source.name}'은 비활성화됩니다.`
    );
    if (!ok) return;
    try {
      await adminVaccinationApi.mergeUserTypeToGlobal(mergeSourceId, targetId);
      success(`'${source.name}' → '${target.name}' 병합 완료`);
      setMergeSourceId(null);
      await load();
    } catch {
      error('병합에 실패했습니다.');
    }
  };

  const activeGlobal = globalItems.filter(i => i.isActive);
  const inactiveGlobal = globalItems.filter(i => !i.isActive);
  const visibleGlobal = showInactive ? globalItems : activeGlobal;

  const mergeSource = userItems.find(i => i.id === mergeSourceId);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 py-6 px-4 animate-in fade-in duration-300">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-surface-green to-transparent p-6 rounded-2xl border border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0 border border-main-green/20">
            <Syringe className="w-6 h-6 text-main-green" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">예방접종 관리</h1>
            <p className="text-xs text-text-sub mt-1 leading-relaxed">
              사용자에게 제공되는 기본 예방접종 항목 및 간격을 통제 관리합니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-xs font-extrabold text-main-green bg-main-green/10 border border-main-green/20 px-3.5 py-2 rounded-xl">
            글로벌 {activeGlobal.length}개
          </span>
          {userItems.length > 0 && (
            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-200 dark:border-amber-900/40 px-3.5 py-2 rounded-xl">
              사용자 추가 {userItems.length}개
            </span>
          )}
        </div>
      </div>

      {/* 새 글로벌 접종 종류 추가 */}
      <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h2 className="text-[12px] font-black text-text-sub uppercase tracking-widest mb-4">새 접종 종류 추가</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
            placeholder="접종명 (예: 광견병, 종합백신)"
            className="flex-1 px-4 py-3 rounded-2xl border border-border bg-background text-sm font-semibold text-text-main placeholder:text-text-sub/45 focus:outline-none focus:border-main-green focus:ring-4 focus:ring-main-green/5 transition-all"
          />
          <input
            type="number"
            value={newInterval}
            onChange={e => setNewInterval(e.target.value)}
            placeholder="간격(일)"
            min={1}
            className="w-full sm:w-32 px-4 py-3 rounded-2xl border border-border bg-background text-sm font-semibold text-text-main placeholder:text-text-sub/45 focus:outline-none focus:border-main-green focus:ring-4 focus:ring-main-green/5 transition-all"
          />
          <Button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="sm:w-32 py-3 rounded-2xl font-extrabold"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            {creating ? '추가 중...' : '추가'}
          </Button>
        </div>
        <p className="text-[11px] text-text-sub/65 mt-3 font-semibold flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-text-sub/50" />
          접종 간격 팁: 365일 = 매년, 180일 = 6개월마다, 30일 = 매월. 비워두면 반복 간격이 지정되지 않습니다.
        </p>
      </section>

      {/* 병합 모드 안내 배너 */}
      {mergeSourceId && mergeSource && (
        <div className="flex items-center gap-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl px-6 py-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <GitMerge className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              사용자 백신 종류인 <span className="text-amber-950 dark:text-amber-100 font-extrabold underline decoration-2 decoration-amber-500">'{mergeSource.name}'</span>을(를) 대체하여 삭제할 글로벌 백신을 클릭해 주세요.
            </p>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/85 mt-1">
              선택 시 해당 사용자의 모든 데이터가 매칭된 글로벌 데이터로 통합되고, 원래 이름은 별칭으로 기억됩니다.
            </p>
          </div>
          <button
            onClick={() => setMergeSourceId(null)}
            className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline px-3 py-1.5 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-xl transition shrink-0"
          >
            취소
          </button>
        </div>
      )}

      {/* 탭 + 목록 */}
      <section className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-border bg-surface-green/5">
          <button
            onClick={() => { setActiveTab('global'); setMergeSourceId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-[13px] font-black transition-colors ${
              activeTab === 'global'
                ? 'text-main-green border-b-2 border-main-green bg-main-green/5'
                : 'text-text-sub hover:text-text-main hover:bg-surface-green/10'
            }`}
          >
            <Syringe className="w-4.5 h-4.5" />
            글로벌 접종 종류
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'global' ? 'bg-main-green/15 text-main-green' : 'bg-border/50 text-text-sub'
            }`}>
              {activeGlobal.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('user'); setMergeSourceId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-[13px] font-black transition-colors ${
              activeTab === 'user'
                ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/20 dark:bg-amber-900/10'
                : 'text-text-sub hover:text-text-main hover:bg-amber-50/20 dark:hover:bg-amber-900/5'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            사용자 추가
            {userItems.length > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'user' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'bg-amber-100/70 dark:bg-amber-900/20 text-amber-500'
              }`}>
                {userItems.length}
              </span>
            )}
          </button>
        </div>

        {/* ── 글로벌 탭 ── */}
        {activeTab === 'global' && (
          <>
            <div className="px-6 py-4.5 border-b border-border/80 flex items-center justify-between bg-surface-green/5">
              <p className="text-[11px] text-text-sub font-semibold">
                시스템 전체 사용자에게 공통으로 추천 및 제공되는 접종 종류 리스트입니다.
              </p>
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="text-xs font-black text-text-sub hover:text-main-green hover:bg-main-green/5 px-3 py-2 rounded-xl transition-all"
              >
                {showInactive ? '비활성 숨기기' : `비활성 포함 (${inactiveGlobal.length})`}
              </button>
            </div>

            {loading ? (
              <div className="py-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-main-green border-t-transparent" />
              </div>
            ) : visibleGlobal.length === 0 ? (
              <div className="py-24 text-center">
                <Syringe className="w-12 h-12 text-border/60 mx-auto mb-3" />
                <p className="text-sm font-black text-text-sub">등록된 접종 종류가 없습니다.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visibleGlobal.map(item => {
                  const isMergeTarget = mergeSourceId !== null && item.isActive;
                  return (
                    <li
                      key={item.id}
                      onClick={() => isMergeTarget && handleMerge(item.id)}
                      className={`flex items-center gap-4 px-6 py-4.5 group transition-colors ${
                        isMergeTarget
                          ? 'hover:bg-amber-50/50 dark:hover:bg-amber-950/10 cursor-pointer border-l-4 border-l-amber-500 bg-amber-50/10'
                          : 'hover:bg-surface-green/20'
                      } ${!item.isActive ? 'opacity-45' : ''}`}
                    >
                      <span className="text-[11px] text-text-sub/50 font-mono w-8 shrink-0 text-right">#{item.id}</span>

                      {editingId === item.id ? (
                        <div className="flex-1 flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                          <input
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleUpdate(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="flex-1 max-w-xs px-3.5 py-2 rounded-xl border-2 border-main-green text-sm font-extrabold text-text-main bg-background focus:outline-none focus:ring-4 focus:ring-main-green/5"
                          />
                          <input
                            type="number"
                            value={editingInterval}
                            onChange={e => setEditingInterval(e.target.value)}
                            placeholder="간격"
                            min={1}
                            className="w-24 px-3.5 py-2 rounded-xl border-2 border-main-green text-sm font-semibold text-text-main bg-background focus:outline-none focus:ring-4 focus:ring-main-green/5"
                          />
                          <button onClick={() => handleUpdate(item.id)} className="p-2 rounded-xl bg-main-green text-white hover:bg-main-green-dark shadow-sm transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 rounded-xl hover:bg-border/60 text-text-sub border border-border transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`flex-1 text-sm font-bold tracking-tight ${item.isActive ? 'text-text-main' : 'text-text-sub line-through'}`}>
                            {item.name}
                          </span>
                          <span className="text-xs font-extrabold text-text-sub/70 bg-border/40 border border-border px-3 py-1 rounded-xl shrink-0">
                            {formatInterval(item.intervalDays)} 간격
                          </span>
                        </>
                      )}

                      {isMergeTarget && editingId !== item.id && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full shrink-0 animate-pulse">
                          여기로 병합
                        </span>
                      )}

                      {editingId !== item.id && !mergeSourceId && item.isActive && (
                        <div className="flex gap-1 opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => { setEditingId(item.id); setEditingName(item.name); setEditingInterval(item.intervalDays != null ? String(item.intervalDays) : ''); }}
                            title="수정"
                            className="p-2 rounded-xl hover:bg-main-green/10 hover:text-main-green text-text-sub transition-colors border border-transparent hover:border-main-green/20"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(item)}
                            title="비활성화"
                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-text-sub transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/45"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* ── 사용자 추가 탭 ── */}
        {activeTab === 'user' && (
          <>
            {/* 병합 설명 */}
            <div className="px-6 py-5 border-b border-border bg-amber-50/40 dark:bg-amber-900/10">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-[13px] font-black text-amber-800 dark:text-amber-400">사용자 개별 등록 항목 병합 프로세스</p>
                  <div className="space-y-1.5 leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-1" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-semibold">
                        사용자가 수동으로 직접 타이핑해 만든 백신 태그들을 관리자가 공용(글로벌) 표준 백신으로 지정 병합합니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-1" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-semibold">
                        병합 시, 사용자들이 가지고 있던 이전 케어기록 데이터가 지정한 글로벌 백신 항목으로 안전하게 일괄 이관됩니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-1" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-semibold">
                        기존에 입력했던 커스텀 명칭은 글로벌 종류의 별칭(alias)으로 자동 기입되어, 추후 작성 시에도 올바르게 매칭됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-amber-400 border-t-transparent" />
              </div>
            ) : userItems.length === 0 ? (
              <div className="py-24 text-center">
                <Users className="w-12 h-12 text-border/60 mx-auto mb-3" />
                <p className="text-sm font-black text-text-sub">사용자가 추가한 접종 종류가 없습니다.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {userItems.map(item => (
                  <li key={item.id} className="flex items-center gap-4 px-6 py-4.5 group hover:bg-amber-50/20 dark:hover:bg-amber-900/10 transition-colors">
                    <span className="text-[11px] text-text-sub/50 font-mono w-8 shrink-0 text-right">#{item.id}</span>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-text-main block truncate tracking-tight">{item.name}</span>
                      {item.groupName && (
                        <span className="inline-block text-[10px] text-text-sub/70 font-bold bg-border/50 px-2 py-0.5 rounded mt-1 border border-border">
                          그룹: {item.groupName}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-text-sub/70 bg-border/30 px-2.5 py-0.5 rounded-lg shrink-0">
                      {formatInterval(item.intervalDays)}
                    </span>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => startMerge(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 transition-colors"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        글로벌로 병합
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
