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
    <div className="max-w-3xl space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-main-green/10 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-main-green" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-main tracking-tight">증상 관리</h1>
          <p className="text-xs text-text-sub mt-0.5">
            증상 스냅 기록 시 사용자에게 제공되는 증상 태그를 관리합니다.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-main-green bg-main-green/10 px-3 py-1.5 rounded-full">
            활성 {activeItems.length}개
          </span>
          {inactiveItems.length > 0 && (
            <span className="text-xs font-bold text-text-sub bg-border/50 px-3 py-1.5 rounded-full">
              비활성 {inactiveItems.length}개
            </span>
          )}
        </div>
      </div>

      {/* 새 증상 추가 */}
      <section className="bg-background rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-[13px] font-black text-text-sub uppercase tracking-wider mb-3">새 증상 추가</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
            placeholder="증상명 입력 (예: 구토, 설사, 기침, 식욕부진)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-text-main placeholder:text-text-sub/50 focus:outline-none focus:border-main-green focus:ring-2 focus:ring-main-green/10 transition"
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
      </section>

      {/* 병합 안내 배너 */}
      {mergeSourceId && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3.5">
          <GitMerge className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 flex-1">
            <span className="text-amber-900 dark:text-amber-200">
              '{items.find(i => i.id === mergeSourceId)?.name}'
            </span>
            을(를) 병합할 대상 증상을 아래 목록에서 클릭하세요.
          </span>
          <button
            onClick={() => setMergeSourceId(null)}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* 증상 목록 */}
      <section className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-black text-text-sub uppercase tracking-wider">증상 목록</h2>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-xs font-bold text-text-sub hover:text-main-green transition-colors"
          >
            {showInactive ? '비활성 숨기기' : '비활성 포함 보기'}
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-main-green border-t-transparent" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="py-16 text-center">
            <Stethoscope className="w-8 h-8 text-border mx-auto mb-2" />
            <p className="text-sm font-bold text-text-sub">등록된 증상이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visibleItems.map(item => {
              const isMergeTarget = mergeSourceId !== null && mergeSourceId !== item.id && item.isActive;
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
                  {/* ID */}
                  <span className="text-[11px] text-text-sub/60 font-mono w-7 shrink-0 text-right">
                    {item.id}
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
                        className="flex-1 px-3 py-1.5 rounded-lg border border-main-green text-sm font-bold text-text-main bg-background focus:outline-none focus:ring-2 focus:ring-main-green/20"
                      />
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="p-1.5 rounded-lg bg-main-green/10 hover:bg-main-green/20 text-main-green transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg hover:bg-border/60 text-text-sub transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className={`flex-1 text-sm font-bold ${item.isActive ? 'text-text-main' : 'text-text-sub line-through'}`}>
                      {item.name}
                    </span>
                  )}

                  {/* 글로벌 배지 */}
                  {item.isGlobal && (
                    <span className="text-[9px] font-black text-main-green bg-main-green/10 px-2 py-0.5 rounded-full shrink-0">
                      GLOBAL
                    </span>
                  )}

                  {/* 병합 대상 힌트 */}
                  {isMergeTarget && (
                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                      병합 대상으로 선택
                    </span>
                  )}

                  {/* 액션 버튼 */}
                  {editingId !== item.id && !mergeSourceId && (
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setMergeSourceId(item.id);
                          setEditingId(null);
                        }}
                        title="다른 증상으로 병합"
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 text-text-sub transition-colors"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingName(item.name);
                        }}
                        title="이름 수정"
                        className="p-1.5 rounded-lg hover:bg-main-green/10 hover:text-main-green text-text-sub transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.isActive ? '비활성화' : '활성화'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isActive
                            ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-text-sub'
                            : 'hover:bg-main-green/10 hover:text-main-green text-text-sub'
                        }`}
                      >
                        {item.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
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
