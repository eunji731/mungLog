'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { inquiryAdminApi, inquiryApi, type Inquiry } from '@/api/inquiryApi';
import { useToast } from '@/app/common/hooks/useToast';

export default function InquiriesAdminPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = async (inq: Inquiry) => {
    const nextId = expandedId === inq.id ? null : inq.id;
    setExpandedId(nextId);
    if (nextId && inq.isNew) {
      try {
        const updated = await inquiryAdminApi.markRead(inq.id);
        setInquiries(prev => prev.map(i => i.id === inq.id ? updated : i));
      } catch {}
    }
  };
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const { success, error } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setInquiries(await inquiryAdminApi.getAll());
    } catch {
      error('문의 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const handleReply = async (inquiryId: string) => {
    const text = replyText[inquiryId]?.trim();
    if (!text) return;
    setSending(inquiryId);
    try {
      const updated = await inquiryAdminApi.reply(inquiryId, text);
      setInquiries(prev => prev.map(i => i.id === inquiryId ? updated : i));
      setReplyText(prev => ({ ...prev, [inquiryId]: '' }));
      success('답변이 등록되었습니다.');
    } catch {
      error('답변 등록에 실패했습니다.');
    } finally {
      setSending(null);
    }
  };

  const formatDate = (iso: string) => iso.slice(0, 10);
  const unreplied = inquiries.filter(i => !i.isReplied);
  const replied = inquiries.filter(i => i.isReplied);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 py-6 px-4 animate-in fade-in duration-300">
      {/* 헤더 */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-surface-green to-transparent p-6 rounded-2xl border border-border/50">
        <div className="w-12 h-12 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0 border border-main-green/20">
          <MessageSquare className="w-6 h-6 text-main-green" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight">문의 관리</h1>
          <p className="text-xs text-text-sub mt-1">사용자 1:1 문의를 확인하고 답변합니다.</p>
        </div>
        {unreplied.length > 0 && (
          <span className="ml-auto text-[11px] font-black text-white bg-main-green px-2.5 py-1 rounded-full">
            미답변 {unreplied.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-main-green animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-background rounded-3xl border border-dashed border-border/80 p-20 text-center">
          <MessageSquare className="w-8 h-8 text-text-sub/30 mx-auto mb-3" />
          <p className="text-sm font-bold text-text-main">접수된 문의가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 미답변 */}
          {unreplied.length > 0 && (
            <div>
              <h2 className="text-[11px] font-black text-text-sub uppercase tracking-widest mb-3 px-1">미답변 ({unreplied.length})</h2>
              <div className="space-y-2">
                {unreplied.map(inq => (
                  <InquiryCard
                    key={inq.id}
                    inquiry={inq}
                    expanded={expandedId === inq.id}
                    replyText={replyText[inq.id] || ''}
                    sending={sending === inq.id}
                    onToggle={() => handleToggle(inq)}
                    onReplyChange={text => setReplyText(prev => ({ ...prev, [inq.id]: text }))}
                    onReply={() => handleReply(inq.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 답변 완료 */}
          {replied.length > 0 && (
            <div>
              <h2 className="text-[11px] font-black text-text-sub uppercase tracking-widest mb-3 px-1">답변 완료 ({replied.length})</h2>
              <div className="space-y-2">
                {replied.map(inq => (
                  <InquiryCard
                    key={inq.id}
                    inquiry={inq}
                    expanded={expandedId === inq.id}
                    replyText={replyText[inq.id] || ''}
                    sending={sending === inq.id}
                    onToggle={() => handleToggle(inq)}
                    onReplyChange={text => setReplyText(prev => ({ ...prev, [inq.id]: text }))}
                    onReply={() => handleReply(inq.id)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface InquiryCardProps {
  inquiry: Inquiry;
  expanded: boolean;
  replyText: string;
  sending: boolean;
  onToggle: () => void;
  onReplyChange: (text: string) => void;
  onReply: () => void;
  formatDate: (iso: string) => string;
}

function InquiryCard({ inquiry, expanded, replyText, sending, onToggle, onReplyChange, onReply, formatDate }: InquiryCardProps) {
  return (
    <div className="bg-background rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-green/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-bold text-text-main truncate">{inquiry.title}</span>
            {inquiry.isNew && (
              <span className="shrink-0 text-[9px] font-black text-white bg-main-green px-1.5 py-0.5 rounded-full">NEW</span>
            )}
            <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
              inquiry.isReplied ? 'bg-main-green/10 text-main-green' : 'bg-amber-100 text-amber-600'
            }`}>
              {inquiry.isReplied ? '답변완료' : '대기중'}
            </span>
          </div>
          <span className="text-[10px] text-text-sub/60 font-semibold mt-0.5 block">{formatDate(inquiry.createdAt)}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-sub shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-text-sub shrink-0 ml-2" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border">
          <p className="text-[13px] text-text-main font-medium leading-relaxed pt-3 whitespace-pre-wrap">{inquiry.content}</p>

          {inquiry.isReplied && inquiry.reply ? (
            <div className="p-3 rounded-xl bg-main-green/5 border border-main-green/20">
              <span className="text-[10px] font-black text-main-green">관리자 답변</span>
              {inquiry.repliedAt && (
                <span className="text-[10px] text-text-sub font-semibold ml-2">{formatDate(inquiry.repliedAt)}</span>
              )}
              <p className="text-[12.5px] text-text-main font-medium mt-1.5 leading-relaxed whitespace-pre-wrap">{inquiry.reply}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={e => onReplyChange(e.target.value)}
                placeholder="답변을 입력하세요"
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[13px] font-medium text-text-main placeholder:text-text-sub/50 focus:outline-none focus:ring-2 focus:ring-main-green/30 focus:border-main-green transition-colors resize-none"
              />
              <button
                onClick={onReply}
                disabled={!replyText.trim() || sending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-main-green text-white font-bold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-main-green/90 transition-all"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                답변 등록
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
