import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  onSave, 
  onDelete,
  isSubmitting, 
  saveLabel = '저장하기', 
  cancelLabel = '취소' 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-10 pt-8 border-t border-orange-100">
      {onDelete && (
        <button
          onClick={onDelete}
          type="button"
          disabled={isSubmitting}
          className="w-full sm:w-auto mr-auto px-4 py-2.5 text-[14px] font-bold text-red-400/80 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer mb-2 sm:mb-0 flex items-center justify-center gap-1.5"
        >
          <span className="text-[12px] opacity-80">🗑️</span>
          정보 삭제
        </button>
      )}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onCancel}
          type="button"
          className="flex-1 sm:w-32 px-4 py-2.5 text-[14px] font-bold text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onSave}
          disabled={isSubmitting}
          type="button"
          className="flex-[2] sm:w-48 bg-amber-500 text-white px-6 py-2.5 rounded-xl text-[14px] font-black shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? '처리 중...' : saveLabel}
        </button>
      </div>
    </div>
  );
};
