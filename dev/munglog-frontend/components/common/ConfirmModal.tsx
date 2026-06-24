import React, { useEffect } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'primary',
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onCancel}
      />
      
      <div 
        className="relative bg-white rounded-[32px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] border border-orange-50 w-full max-w-[380px] overflow-hidden animate-in zoom-in-95 fade-in duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-10 pb-8 text-center">
          {variant === 'danger' && (
            <div className="inline-flex w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-6 shadow-inner ring-4 ring-red-50/50">
              <span className="text-3xl">🗑️</span>
            </div>
          )}
          <h3 className="text-[21px] font-black text-stone-800 tracking-tight leading-snug">
            {title}
          </h3>
          <p className="mt-4 text-[15px] text-stone-500 font-bold leading-relaxed whitespace-pre-wrap px-2">
            {description}
          </p>
        </div>

        <div className="px-8 pb-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 order-2 sm:order-1 py-4 px-4 bg-stone-100 text-stone-500 font-black rounded-2xl hover:bg-stone-200 active:scale-95 transition-all text-[15px] cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex-[1.2] order-1 sm:order-2 py-4 px-4 font-black rounded-2xl active:scale-95 transition-all text-[15px] shadow-xl
              ${variant === 'danger' 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'}
              disabled:opacity-50 cursor-pointer
            `}
          >
            {loading ? '처리 중...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
