'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Check, X, Power, PowerOff, GitMerge, Stethoscope } from 'lucide-react';
import { symptomMasterApi, type SymptomMaster } from '@/api/symptomMasterApi';
import { Button } from '@/components/common/Button';
import { useToast } from '@/app/common/hooks/useToast';
import { useConfirm } from '@/app/common/hooks/useConfirm';

export default function SymptomsAdminPage() {
  const [items, setItems] = useState<SymptomMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [mergeSourceId, setMergeSourceId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await symptomMasterApi.getAll();
      setItems(data);
    } catch {
      error('증상 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await symptomMasterApi.create({ name });
      success(`'${name}' 증상이 추가되었습니다.`);
      setNewName('');
      await load();
    } catch {
      error('증상 추가에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await symptomMasterApi.update(id, { name });
      success('수정되었습니다.');
      setEditingId(null);
      await load();
    } catch {
      error('수정에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: SymptomMaster) => {
    const ok = await confirm(
      item.isActive
        ? `'${item.name}'을(를) 비활성화하시겠습니까?\n비활성화된 증상은 사용자에게 표시되지 않습니다.`
        : `'${item.name}'을(를) 다시 활성화하시겠습니까?`
    );
    if (!ok) return;
    try {
      if (item.isActive) {
        await symptomMasterApi.deactivate(item.id);
        success(`'${item.name}' 비활성화되었습니다.`);
      } else {
        await symptomMasterApi.activate(item.id);
        success(`'${item.name}' 활성화되었습니다.`);
      }
      await load();
    } catch {
      error('상태 변경에 실패했습니다.');
    }
  };

  const handleMerge = async (targetId: number) => {
    if (!mergeSourceId || mergeSourceId === targetId) return;
    const source = items.find(i => i.id === mergeSourceId);
    const target = items.find(i => i.id === targetId);
    if (!source || !target) return;
    const ok = await confirm(
      `'${source.name}'을(를) '${target.name}'으로 병합하시겠습니까?\n'${source.name}'의 모든 기록이 '${target.name}'으로 이동되고 '${source.name}'은 삭제됩니다.`
    );
    if (!ok) return;
    try {
      await symptomMasterApi.merge(mergeSourceId, targetId);
      success(`'${source.name}' → '${target.name}' 병합 완료`);
      setMergeSourceId(null);
      await load();
    } catch {
      error('병합에 실패했습니다.');
    }
  };

  const activeItems = items.filter(i => i.isActive);
  const inactiveItems = items.filter(i => !i.isActive);
  const visibleItems = showInactive ? items : activeItems;

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 py-6 px-4 animate-in fade-in duration-300">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-surface-green to-transparent p-6 rounded-2xl border border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0 border border-main-green/20">
            <Stethoscope className="w-6 h-6 text-main-green" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">증상 관리</h1>
            <p className="text-xs text-text-sub mt-1 leading-relaxed">
              증상 스냅 기록 시 사용자에게 제공되는 증상 태그를 통합 관리합니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-xs font-extrabold text-main-green bg-main-green/10 border border-main-green/20 px-3.5 py-2 rounded-xl">
            활성 {activeItems.length}개
          </span>
          {inactiveItems.length > 0 && (
            <span className="text-xs font-extrabold text-text-sub bg-border/50 border border-border px-3.5 py-2 rounded-xl">
              비활성 {inactiveItems.length}개
            </span>
          )}
        </div>
      </div>

      {/* 새 증상 추가 */}
      <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h2 className="text-[12px] font-black text-text-sub uppercase tracking-widest mb-4">새 증상 추가</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
            placeholder="증상명 입력 (예: 구토, 설사, 기침, 식욕부진)"
            className="flex-1 px-4 py-3 rounded-2xl border border-border bg-background text-sm font-semibold text-text-main placeholder:text-text-sub/45 focus:outline-none focus:border-main-green focus:ring-4 focus:ring-main-green/5 transition-all"
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
      </section>

      {/* 병합 안내 배너 */}
      {mergeSourceId && (
        <div className="flex items-center gap-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl px-6 py-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <GitMerge className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300 flex-1 leading-relaxed">
            <span className="text-amber-950 dark:text-amber-100 font-extrabold underline decoration-2 decoration-amber-500">
              '{items.find(i => i.id === mergeSourceId)?.name}'
            </span>
            을(를) 병합해 삭제할 대상 증상을 아래 목록에서 골라 클릭해 주세요.
          </span>
          <button
            onClick={() => setMergeSourceId(null)}
            className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline px-3 py-1.5 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-xl transition"
          >
            취소
          </button>
        </div>
      )}

      {/* 증상 목록 */}
      <section className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between bg-surface-green/5">
          <h2 className="text-[12px] font-black text-text-sub uppercase tracking-widest">증상 목록</h2>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-xs font-black text-text-sub hover:text-main-green hover:bg-main-green/5 px-3 py-2 rounded-xl transition-all"
          >
            {showInactive ? '비활성 숨기기' : '비활성 포함 보기'}
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-main-green border-t-transparent" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="py-24 text-center">
            <Stethoscope className="w-12 h-12 text-border/60 mx-auto mb-3" />
            <p className="text-sm font-black text-text-sub">등록된 증상이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visibleItems.map(item => {
              const isMergeTarget = mergeSourceId !== null && mergeSourceId !== item.id && item.isActive;
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
                  {/* ID */}
                  <span className="text-[11px] text-text-sub/50 font-mono w-8 shrink-0 text-right">
                    #{item.id}
                  </span>

                  {/* 이름 영역 */}
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
                        className="flex-1 max-w-sm px-3.5 py-2 rounded-xl border-2 border-main-green text-sm font-extrabold text-text-main bg-background focus:outline-none focus:ring-4 focus:ring-main-green/5"
                      />
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="p-2 rounded-xl bg-main-green text-white hover:bg-main-green-dark shadow-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-xl hover:bg-border/60 text-text-sub border border-border transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className={`flex-1 text-sm font-bold tracking-tight ${item.isActive ? 'text-text-main' : 'text-text-sub line-through'}`}>
                      {item.name}
                    </span>
                  )}

                  {/* 글로벌 배지 */}
                  {item.isGlobal && (
                    <span className="text-[9px] font-black text-main-green bg-main-green/10 border border-main-green/20 px-2 py-0.5 rounded-md shrink-0">
                      GLOBAL
                    </span>
                  )}

                  {/* 병합 대상 힌트 */}
                  {isMergeTarget && (
                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full shrink-0 animate-pulse">
                      여기로 병합
                    </span>
                  )}

                  {/* 액션 버튼 */}
                  {editingId !== item.id && !mergeSourceId && (
                    <div
                      className="flex gap-1 opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setMergeSourceId(item.id);
                          setEditingId(null);
                        }}
                        title="다른 증상으로 병합"
                        className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 text-text-sub transition-colors border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                      >
                        <GitMerge className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingName(item.name);
                        }}
                        title="이름 수정"
                        className="p-2 rounded-xl hover:bg-main-green/10 hover:text-main-green text-text-sub transition-colors border border-transparent hover:border-main-green/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? '비활성화' : '활성화'}
                        className={`p-2 rounded-xl transition-colors border border-transparent ${
                          item.isActive
                            ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-text-sub hover:border-red-100 dark:hover:border-red-900/45'
                            : 'hover:bg-main-green/10 hover:text-main-green text-text-sub hover:border-main-green/20'
                        }`}
                      >
                        {item.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
