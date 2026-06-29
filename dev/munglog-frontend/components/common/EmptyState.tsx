import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline';
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: EmptyStateAction;
  variant?: 'page' | 'section' | 'mini';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'section',
  className = '',
}) => {
  if (variant === 'page') {
    return (
      <div className={`min-h-screen bg-background flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="text-center max-w-sm w-full p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-border shadow-sm">
          <div className="text-5xl mb-6 block grayscale opacity-20">{icon}</div>
          <h2 className="text-[22px] font-black text-text-main mb-3 tracking-tight">{title}</h2>
          {description && (
            <p className="text-text-sub font-medium mb-10 leading-relaxed text-sm px-4 break-keep">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="w-full h-[56px] bg-main-green text-white rounded-[16px] font-black text-[15px] shadow-lg shadow-main-green/20 active:scale-95 transition-all hover:bg-main-green/90"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'mini') {
    return (
      <div className={`py-16 text-center bg-background rounded-3xl border border-border shadow-sm ${className}`}>
        <div className="text-3xl mb-3 block opacity-20">{icon}</div>
        <h3 className="text-[16px] font-black text-foreground tracking-tight">{title}</h3>
        {description && <p className="text-text-sub font-medium text-[13px]">{description}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-24 bg-background rounded-3xl border border-border shadow-sm px-6 text-center ${className}`}>
      <div className="w-16 h-16 bg-surface-green/20 rounded-2xl flex items-center justify-center mb-6 border border-border">
        <div className="text-3xl grayscale opacity-40">{icon}</div>
      </div>
      <h3 className="text-[20px] font-black text-foreground mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-text-sub font-medium text-sm mb-6 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={
            action.variant === 'primary'
              ? 'h-[48px] px-8 bg-main-green text-white rounded-xl font-black text-[14px] shadow-lg shadow-main-green/20 active:scale-95 transition-all hover:bg-main-green/90'
              : 'h-[48px] px-8 rounded-xl border border-border text-foreground font-black text-[14px] hover:bg-surface-green transition-all'
          }
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
