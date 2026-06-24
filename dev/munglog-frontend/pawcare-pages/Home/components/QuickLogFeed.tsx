import React, { useState, useEffect, useCallback } from 'react';
import { healthLogApi } from '@/api/healthLogApi';
import { useToast } from '@/context/ToastContext';
import type { HealthLog } from '@/api/healthLogApi';

interface QuickLogFeedProps {
  selectedDogId?: string;
}

export const QuickLogFeed: React.FC<QuickLogFeedProps> = ({ selectedDogId }) => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchLogs = useCallback(async () => {
    if (!selectedDogId) {
      setLogs([]);
      return;
    }
    try {
      const data = await healthLogApi.getRecentLogs(selectedDogId);
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch health logs:', err);
    }
  }, [selectedDogId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 통합 등록 함수
  const handleAddLog = async (text: string) => {
    if (!selectedDogId) return showToast('반려견을 먼저 선택해 주세요.', 'warning');
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      await healthLogApi.createLog({
        dogId: selectedDogId,
        content: text.trim()
      });
      setContent('');
      await fetchLogs(); // 목록 즉시 갱신
      showToast('메모가 저장되었습니다! ✨', 'success');
    } catch (err) {
      console.error('Save failed:', err);
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddLog(content);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('기록을 삭제하시겠습니까?')) return;
    try {
      await healthLogApi.deleteLog(id);
      fetchLogs();
      showToast('삭제되었습니다.', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  const quickEmojis = [
    { icon: '💩', label: '대변' },
    { icon: '🤮', label: '구토' },
    { icon: '🍚', label: '식사' },
    { icon: '💊', label: '복약' },
    { icon: '💧', label: '음수' },
  ];

  return (
    <div className="bg-white rounded-[32px] border border-stone-100 shadow-sm flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-stone-50 shrink-0">
        <h3 className="text-[16px] font-black text-[#2D2D2D] flex items-center gap-2">
          <span>📝</span> 퀵 관찰 메모
        </h3>
      </div>

      {/* Input Area */}
      <div className="p-5 bg-stone-50/50 shrink-0 space-y-4">
        <div className="flex gap-2">
          {quickEmojis.map(item => (
            <button
              key={item.label}
              type="button" // 중요: 기본 submit 방지
              onClick={() => handleAddLog(`${item.icon} ${item.label} 확인`)}
              className="flex-1 py-2 bg-white border border-stone-100 rounded-xl text-xl hover:border-[#FF6B00] hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
              disabled={isLoading || !selectedDogId}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={selectedDogId ? "직접 입력하기..." : "반려견을 선택하세요"}
            className="w-full h-[48px] pl-4 pr-12 bg-white border border-stone-200 rounded-xl text-[14px] font-bold outline-none focus:border-[#FF6B00] transition-all disabled:bg-stone-100"
            disabled={isLoading || !selectedDogId}
          />
          <button
            type="submit"
            disabled={isLoading || !content.trim() || !selectedDogId}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-[32px] h-[32px] bg-[#FF6B00] text-white rounded-lg flex items-center justify-center text-sm disabled:bg-stone-200 transition-all"
          >
            ↵
          </button>
        </form>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="group p-4 bg-white border border-stone-100 rounded-2xl flex justify-between items-start gap-3 hover:border-orange-100 hover:shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="space-y-1">
                <p className="text-[14px] font-bold text-stone-700 leading-relaxed break-all">
                  {log.content}
                </p>
                <span className="text-[11px] font-black text-stone-300 uppercase tracking-tighter tabular-nums">
                  {new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(log.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-400 transition-all"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-2 opacity-50">
            <span className="text-3xl">🏜️</span>
            <p className="text-[13px] font-bold">아직 기록된 메모가 없어요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
