'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, MessageSquare, Send, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { noticeApi, type Notice } from '@/api/noticeApi';
import { inquiryApi, type Inquiry } from '@/api/inquiryApi';

type Tab = 'notices' | 'messages';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: Tab;
  onBadgeUpdate?: () => void;
}

export default function NotificationPanel({ isOpen, onClose, defaultTab = 'notices', onBadgeUpdate }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await noticeApi.getAll();
      setNotices(data);
      if (data.some(n => n.isNew)) {
        await noticeApi.markAllRead();
        setNotices(data.map(n => ({ ...n, isNew: false })));
        onBadgeUpdate?.();
      }
    } finally {
      setLoading(false);
    }
  }, [onBadgeUpdate]);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      setInquiries(await inquiryApi.getMyInquiries());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setTab(defaultTab);
    setComposing(false);
    setSelectedNotice(null);
    setSelectedInquiry(null);
    if (defaultTab === 'notices') loadNotices();
    else loadInquiries();
  }, [isOpen, defaultTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (next: Tab) => {
    setTab(next);
    setSelectedNotice(null);
    setSelectedInquiry(null);
    setComposing(false);
    if (next === 'notices') loadNotices();
    else loadInquiries();
  };

  const handleSelectInquiry = async (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (inq.isReplyNew) {
      try {
        const updated = await inquiryApi.markReplyRead(inq.id);
        setInquiries(prev => prev.map(i => i.id === inq.id ? updated : i));
        setSelectedInquiry(updated);
        onBadgeUpdate?.();
      } catch {}
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    try {
      const created = await inquiryApi.create({ title, content });
      setInquiries(prev => [created, ...prev]);
      setComposing(false);
      setTitle('');
      setContent('');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (iso: string) => iso.slice(0, 10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[115] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-2xl h-[85vh] max-h-[680px] z-[116] bg-background shadow-2xl rounded-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >

        {/* 탭 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex gap-1 p-1 bg-surface-green rounded-xl">
            <button
              onClick={() => switchTab('notices')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all ${
                tab === 'notices' ? 'bg-background text-main-green shadow-sm' : 'text-text-sub hover:text-text-main'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              공지사항
            </button>
            <button
              onClick={() => switchTab('messages')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all ${
                tab === 'messages' ? 'bg-background text-main-green shadow-sm' : 'text-text-sub hover:text-text-main'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              문의함
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-text-sub hover:text-text-main hover:bg-border/50 rounded-lg transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-main-green animate-spin" />
          </div>
        )}

        {/* 공지사항 목록 */}
        {!loading && tab === 'notices' && !selectedNotice && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-text-sub">
                <Bell className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-bold">공지사항이 없습니다</p>
              </div>
            ) : notices.map(notice => (
              <button
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="w-full text-left p-5 rounded-xl border border-border hover:border-main-green/30 hover:bg-surface-green/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[15px] font-extrabold text-text-main truncate">{notice.title}</span>
                    {notice.isNew && (
                      <span className="shrink-0 text-[9px] font-black text-white bg-main-green px-1.5 py-0.5 rounded-full">NEW</span>
                    )}
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-text-sub group-hover:text-main-green transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-[13px] text-text-sub font-medium mt-1.5 line-clamp-2 leading-relaxed">{notice.content}</p>
                <span className="text-[11px] text-text-sub/60 font-semibold mt-2.5 block">{formatDate(notice.createdAt)}</span>
              </button>
            ))}
          </div>
        )}

        {/* 공지사항 상세 */}
        {!loading && tab === 'notices' && selectedNotice && (
          <div className="flex-1 overflow-y-auto p-6">
            <button onClick={() => setSelectedNotice(null)} className="text-[12.5px] text-text-sub hover:text-main-green font-bold mb-4 flex items-center gap-1 transition-colors">
              ← 목록으로
            </button>
            <h2 className="text-[18px] font-black text-text-main leading-tight">{selectedNotice.title}</h2>
            <span className="text-[11.5px] text-text-sub font-semibold mt-1 block">{formatDate(selectedNotice.createdAt)}</span>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[14.5px] text-text-main font-medium leading-relaxed whitespace-pre-wrap">{selectedNotice.content}</p>
            </div>
          </div>
        )}

        {/* 문의 목록 */}
        {!loading && tab === 'messages' && !composing && !selectedInquiry && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {inquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-text-sub">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-bold">문의 내역이 없습니다</p>
                </div>
              ) : inquiries.map(inq => (
                <button
                  key={inq.id}
                  onClick={() => handleSelectInquiry(inq)}
                  className="w-full text-left p-5 rounded-xl border border-border hover:border-main-green/30 hover:bg-surface-green/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[15px] font-extrabold text-text-main truncate">{inq.title}</span>
                      {inq.isReplyNew && (
                        <span className="shrink-0 text-[9px] font-black text-white bg-main-green px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                    <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      inq.isReplied ? 'bg-main-green/10 text-main-green' : 'bg-border text-text-sub'
                    }`}>
                      {inq.isReplied ? '답변완료' : '대기중'}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-sub font-medium mt-1.5 line-clamp-2 leading-relaxed">{inq.content}</p>
                  <span className="text-[11px] text-text-sub/60 font-semibold mt-2.5 block">{formatDate(inq.createdAt)}</span>
                </button>
              ))}
            </div>
            <div className="p-5 border-t border-border shrink-0 bg-background">
              <button
                onClick={() => setComposing(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-main-green text-white font-bold text-[14.5px] hover:bg-main-green/90 transition-colors shadow-md shadow-main-green/10"
              >
                <Plus className="w-4.5 h-4.5" />
                새 문의 작성
              </button>
            </div>
          </>
        )}

        {/* 문의 상세 */}
        {!loading && tab === 'messages' && selectedInquiry && !composing && (
          <div className="flex-1 overflow-y-auto p-6">
            <button onClick={() => setSelectedInquiry(null)} className="text-[12.5px] text-text-sub hover:text-main-green font-bold mb-4 flex items-center gap-1 transition-colors">
              ← 목록으로
            </button>
            <div className="p-5 rounded-xl bg-surface-green border border-border">
              <h2 className="text-[15px] font-black text-text-main">{selectedInquiry.title}</h2>
              <span className="text-[11px] text-text-sub font-semibold mt-0.5 block">{formatDate(selectedInquiry.createdAt)}</span>
              <p className="text-[14px] text-text-main font-medium mt-3 leading-relaxed whitespace-pre-wrap">{selectedInquiry.content}</p>
            </div>
            {selectedInquiry.isReplied && selectedInquiry.reply ? (
              <div className="mt-4 p-5 rounded-xl bg-main-green/5 border border-main-green/20">
                <span className="text-[11px] font-black text-main-green uppercase tracking-wider">관리자 답변</span>
                {selectedInquiry.repliedAt && (
                  <span className="text-[11px] text-text-sub font-semibold ml-2">{formatDate(selectedInquiry.repliedAt)}</span>
                )}
                <p className="text-[14px] text-text-main font-medium mt-2.5 leading-relaxed whitespace-pre-wrap">{selectedInquiry.reply}</p>
              </div>
            ) : (
              <div className="mt-4 p-5 rounded-xl bg-border/30 border border-border">
                <p className="text-[13px] text-text-sub font-semibold text-center">답변 대기 중입니다</p>
              </div>
            )}
          </div>
        )}

        {/* 문의 작성 */}
        {!loading && tab === 'messages' && composing && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <button onClick={() => setComposing(false)} className="text-[12.5px] text-text-sub hover:text-main-green font-bold flex items-center gap-1 transition-colors">
              ← 취소
            </button>
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-black text-text-sub uppercase tracking-wider">제목</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="문의 제목을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[14px] font-semibold text-text-main placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-black text-text-sub uppercase tracking-wider">내용</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="문의 내용을 자세히 입력해 주세요"
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[14px] font-semibold text-text-main placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!title.trim() || !content.trim() || sending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-main-green text-white font-bold text-[14.5px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-main-green/90 transition-all shadow-md shadow-main-green/10"
            >
              {sending ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
              문의 보내기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
