import React, { useState } from 'react';
import { healthLogApi } from '@/api/healthLogApi';
import { useToast } from '@/context/ToastContext';

interface ContextBarProps {
  selectedDogId?: string;
  onDogChange: (dogId: string) => void;
  dogs: Array<{id: string, name: string}>;
  onMemoAdded?: () => void; // 메모 등록 후 목록 갱신을 위한 콜백
}

export const ContextBar: React.FC<ContextBarProps> = ({ 
  selectedDogId, 
  onDogChange, 
  dogs,
  onMemoAdded 
}) => {
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDogId) return showToast('반려견을 먼저 선택해 주세요.', 'warning');
    if (!memo.trim()) return;

    try {
      setIsSubmitting(true);
      await healthLogApi.createLog({
        dogId: selectedDogId,
        content: memo.trim()
      });
      setMemo('');
      showToast('퀵 메모가 저장되었습니다! ✨', 'success');
      if (onMemoAdded) onMemoAdded();
    } catch (err) {
      console.error('Failed to save quick memo:', err);
      showToast('메모 저장에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
      {/* 1. 강아지 선택 */}
      <div className="relative group shrink-0 w-full lg:w-auto">
        <select 
          value={selectedDogId || ''}
          onChange={(e) => onDogChange(e.target.value)}
          className="appearance-none bg-white w-full lg:w-[180px] h-[56px] pl-6 pr-12 rounded-2xl border border-stone-100 shadow-sm text-[#2D2D2D] font-black text-[16px] outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 cursor-pointer transition-all"
        >
          <option value="" disabled>반려견 선택</option>
          {dogs.map(dog => (
            <option key={dog.id} value={dog.id}>🐶 {dog.name}</option>
          ))}
        </select>
        <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 font-bold group-hover:text-[#FF6B00] transition-colors">▼</span>
      </div>
      
      {/* 2. 퀵 메모 입력 폼 */}
      <form 
        onSubmit={handleSubmit}
        className="flex flex-1 items-center gap-3 px-2 h-[56px] bg-white border border-stone-100 rounded-2xl shadow-sm w-full focus-within:border-[#FF6B00]/50 transition-all"
      >
        <span className="pl-4 text-xl leading-none">✍️</span>
        <input 
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="현재 상태를 빠르게 메모하세요... (예: 오늘 아침 사료 남김)"
          className="flex-1 bg-transparent border-none outline-none text-[14px] font-bold text-stone-600 placeholder:text-stone-300"
          disabled={isSubmitting}
        />
        <button 
          type="submit"
          disabled={isSubmitting || !memo.trim()}
          className="h-[40px] px-5 mr-1.5 bg-[#FF6B00] text-white rounded-xl font-black text-[13px] shadow-lg shadow-orange-500/20 active:scale-95 disabled:bg-stone-200 disabled:shadow-none transition-all"
        >
          {isSubmitting ? '...' : '저장'}
        </button>
      </form>
    </div>
  );
};
