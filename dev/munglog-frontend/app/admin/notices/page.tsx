'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { noticeAdminApi, noticeApi, type Notice } from '@/api/noticeApi';
import { useToast } from '@/app/common/hooks/useToast';
import { useConfirm } from '@/app/common/hooks/useConfirm';

export default function NoticesAdminPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setNotices(await noticeApi.getAll());
    } catch {
      error('공지사항 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const created = await noticeAdminApi.create({ title: newTitle.trim(), content: newContent.trim() });
      setNotices(prev => [created, ...prev]);
      setNewTitle('');
      setNewContent('');
      setComposing(false);
      success('공지사항이 등록되었습니다.');
    } catch {
      error('공지사항 등록에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setEditTitle(notice.title);
    setEditContent(notice.content);
    setComposing(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      const updated = await noticeAdminApi.update(editingId, { title: editTitle.trim(), content: editContent.trim() });
      setNotices(prev => prev.map(n => n.id === editingId ? updated : n));
      setEditingId(null);
      success('공지사항이 수정되었습니다.');
    } catch {
      error('공지사항 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm(`'${title}' 공지사항을 삭제하시겠습니까?`);
    if (!ok) return;
    try {
      await noticeAdminApi.delete(id);
      setNotices(prev => prev.filter(n => n.id !== id));
      success('공지사항이 삭제되었습니다.');
    } catch {
      error('공지사항 삭제에 실패했습니다.');
    }
  };

  const formatDate = (iso: string) => iso.slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 py-6 px-4 animate-in fade-in duration-300">
      {/* 헤더 */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-surface-green to-transparent p-6 rounded-2xl border border-border/50">
        <div className="w-12 h-12 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0 border border-main-green/20">
          <Bell className="w-6 h-6 text-main-green" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-text-main tracking-tight">공지사항 관리</h1>
          <p className="text-xs text-text-sub mt-1">사용자에게 공지할 내용을 작성하고 관리합니다.</p>
        </div>
        <button
          onClick={() => { setComposing(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-main-green text-white font-bold text-[13px] hover:bg-main-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 공지 작성
        </button>
      </div>

      {/* 작성 폼 */}
      {composing && (
        <div className="bg-background rounded-2xl border border-main-green/30 p-5 space-y-3 shadow-sm">
          <h2 className="text-[13px] font-black text-main-green">새 공지사항 작성</h2>
          <div>
            <label className="text-[11px] font-black text-text-sub uppercase tracking-wider">제목</label>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요"
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-border bg-background text-[13.5px] font-medium text-text-main placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] font-black text-text-sub uppercase tracking-wider">내용</label>
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              rows={5}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-border bg-background text-[13.5px] font-medium text-text-main placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors resize-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newContent.trim() || creating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-main-green text-white font-bold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-main-green/90 transition-all"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              등록
            </button>
            <button
              onClick={() => { setComposing(false); setNewTitle(''); setNewContent(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-sub font-bold text-[13px] hover:bg-border/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-main-green animate-spin" />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-background rounded-3xl border border-dashed border-border/80 p-20 text-center">
          <Bell className="w-8 h-8 text-text-sub/30 mx-auto mb-3" />
          <p className="text-sm font-bold text-text-main">등록된 공지사항이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map(notice => (
            <div key={notice.id} className="bg-background rounded-2xl border border-border overflow-hidden">
              {editingId === notice.id ? (
                <div className="p-5 space-y-3">
                  <div>
                    <label className="text-[11px] font-black text-text-sub uppercase tracking-wider">제목</label>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-border bg-background text-[13.5px] font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-text-sub uppercase tracking-wider">내용</label>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={5}
                      className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-border bg-background text-[13.5px] font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={!editTitle.trim() || !editContent.trim() || saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-main-green text-white font-bold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-main-green/90 transition-all"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-sub font-bold text-[13px] hover:bg-border/30 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold text-text-main">{notice.title}</span>
                    </div>
                    <p className="text-[12px] text-text-sub font-medium mt-1 line-clamp-2 whitespace-pre-wrap">{notice.content}</p>
                    <span className="text-[10px] text-text-sub/60 font-semibold mt-1.5 block">{formatDate(notice.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(notice)}
                      className="p-2 text-text-sub hover:text-main-green hover:bg-main-green/5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id, notice.title)}
                      className="p-2 text-text-sub hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
