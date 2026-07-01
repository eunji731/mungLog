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
    <div className="max-w-3xl space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-main-green/10 flex items-center justify-center shrink-0">
          <Syringe className="w-5 h-5 text-main-green" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-main tracking-tight">예방접종 관리</h1>
          <p className="text-xs text-text-sub mt-0.5">
            사용자에게 제공되는 기본 예방접종 종류를 관리합니다.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-main-green bg-main-green/10 px-3 py-1.5 rounded-full">
            글로벌 {activeGlobal.length}개
          </span>
          {userItems.length > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
              사용자 추가 {userItems.length}개
            </span>
          )}
        </div>
      </div>

      {/* 새 글로벌 접종 종류 추가 */}
      <section className="bg-background rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-[13px] font-black text-text-sub uppercase tracking-wider mb-3">새 접종 종류 추가</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
            placeholder="접종명 (예: 광견병, 종합백신)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-text-main placeholder:text-text-sub/50 focus:outline-none focus:border-main-green focus:ring-2 focus:ring-main-green/10 transition"
          />
          <input
            type="number"
            value={newInterval}
            onChange={e => setNewInterval(e.target.value)}
            placeholder="간격(일)"
            min={1}
            className="w-28 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-text-main placeholder:text-text-sub/50 focus:outline-none focus:border-main-green focus:ring-2 focus:ring-main-green/10 transition"
          />
          <Button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {creating ? '추가 중...' : '추가'}
          </Button>
        </div>
        <p className="text-[11px] text-text-sub/60 mt-2 font-medium">
          접종 간격: 365 = 매년, 180 = 6개월마다, 30 = 매월. 비워두면 간격 없음.
        </p>
      </section>

      {/* 병합 모드 안내 배너 */}
      {mergeSourceId && mergeSource && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3.5">
          <GitMerge className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              <span className="text-amber-900 dark:text-amber-200">'{mergeSource.name}'</span>
              을(를) 병합할 글로벌 접종 종류를 목록에서 클릭하세요.
            </p>
            <p className="text-[11px] text-amber-600/80 mt-0.5">
              선택한 글로벌 종류로 케어기록이 이동되고, '{mergeSource.name}'은 별칭으로 등록됩니다.
            </p>
          </div>
          <button
            onClick={() => setMergeSourceId(null)}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors shrink-0"
          >
            취소
          </button>
        </div>
      )}

      {/* 탭 + 목록 */}
      <section className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-border">
          <button
            onClick={() => { setActiveTab('global'); setMergeSourceId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-[13px] font-black transition-colors ${
              activeTab === 'global'
                ? 'text-main-green border-b-2 border-main-green bg-main-green/5'
                : 'text-text-sub hover:text-text-main hover:bg-surface-green/10'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            글로벌 접종 종류
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === 'global' ? 'bg-main-green/15 text-main-green' : 'bg-border/50 text-text-sub'
            }`}>
              {activeGlobal.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('user'); setMergeSourceId(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-[13px] font-black transition-colors ${
              activeTab === 'user'
                ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                : 'text-text-sub hover:text-text-main hover:bg-amber-50/30 dark:hover:bg-amber-900/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            사용자 추가
            {userItems.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
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
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-surface-green/10">
              <p className="text-[11px] text-text-sub font-medium">
                모든 사용자에게 기본 제공되는 접종 종류입니다.
              </p>
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="text-xs font-bold text-text-sub hover:text-main-green transition-colors"
              >
                {showInactive ? '비활성 숨기기' : `비활성 포함${inactiveGlobal.length > 0 ? ` (${inactiveGlobal.length})` : ''}`}
              </button>
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-main-green border-t-transparent" />
              </div>
            ) : visibleGlobal.length === 0 ? (
              <div className="py-16 text-center">
                <Syringe className="w-8 h-8 text-border mx-auto mb-2" />
                <p className="text-sm font-bold text-text-sub">등록된 접종 종류가 없습니다.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visibleGlobal.map(item => {
                  const isMergeTarget = mergeSourceId !== null && item.isActive;
                  return (
                    <li
                      key={item.id}
                      onClick={() => isMergeTarget && handleMerge(item.id)}
                      className={`flex items-center gap-3 px-5 py-3.5 group transition-colors ${
                        isMergeTarget
                          ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer'
                          : 'hover:bg-surface-green/20'
                      } ${!item.isActive ? 'opacity-40' : ''}`}
                    >
                      <span className="text-[11px] text-text-sub/60 font-mono w-7 shrink-0 text-right">{item.id}</span>

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
                            className="flex-1 px-3 py-1.5 rounded-lg border border-main-green text-sm font-bold text-text-main bg-background focus:outline-none focus:ring-2 focus:ring-main-green/20"
                          />
                          <input
                            type="number"
                            value={editingInterval}
                            onChange={e => setEditingInterval(e.target.value)}
                            placeholder="간격(일)"
                            min={1}
                            className="w-24 px-3 py-1.5 rounded-lg border border-main-green text-sm font-medium text-text-main bg-background focus:outline-none focus:ring-2 focus:ring-main-green/20"
                          />
                          <button onClick={() => handleUpdate(item.id)} className="p-1.5 rounded-lg bg-main-green/10 hover:bg-main-green/20 text-main-green transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-border/60 text-text-sub transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`flex-1 text-sm font-bold ${item.isActive ? 'text-text-main' : 'text-text-sub line-through'}`}>
                            {item.name}
                          </span>
                          <span className="text-[11px] font-bold text-text-sub/70 bg-border/30 px-2 py-0.5 rounded-full shrink-0">
                            {formatInterval(item.intervalDays)}
                          </span>
                        </>
                      )}

                      {isMergeTarget && editingId !== item.id && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          여기로 병합
                        </span>
                      )}

                      {editingId !== item.id && !mergeSourceId && item.isActive && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => { setEditingId(item.id); setEditingName(item.name); setEditingInterval(item.intervalDays != null ? String(item.intervalDays) : ''); }}
                            title="수정"
                            className="p-1.5 rounded-lg hover:bg-main-green/10 hover:text-main-green text-text-sub transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(item)}
                            title="비활성화"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-text-sub transition-colors"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
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
            <div className="px-5 py-4 border-b border-border bg-amber-50/40 dark:bg-amber-900/10">
              <div className="flex gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-[12px] font-black text-amber-700 dark:text-amber-400">병합(Merge)이란?</p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                        사용자가 추가한 접종 종류를 글로벌 표준 종류로 흡수합니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                        해당 사용자의 모든 케어기록이 글로벌 접종 종류로 자동 이전됩니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                        사용자가 입력한 이름이 글로벌 종류의 별칭으로 등록되어, 이후 같은 이름 입력 시 자동으로 매칭됩니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                        원본(사용자 추가 종류)은 비활성화됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-amber-400 border-t-transparent" />
              </div>
            ) : userItems.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-8 h-8 text-border mx-auto mb-2" />
                <p className="text-sm font-bold text-text-sub">사용자가 추가한 접종 종류가 없습니다.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {userItems.map(item => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors">
                    <span className="text-[11px] text-text-sub/60 font-mono w-7 shrink-0 text-right">{item.id}</span>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-text-main block truncate">{item.name}</span>
                      {item.groupName && (
                        <span className="text-[11px] text-text-sub/70 font-medium">
                          그룹: {item.groupName}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-text-sub/70 bg-border/30 px-2 py-0.5 rounded-full shrink-0">
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
