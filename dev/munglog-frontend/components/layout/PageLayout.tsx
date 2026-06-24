import React from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  noPaddingTop?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, description, children, maxWidth = 'max-w-4xl', noPaddingTop = false }) => {
  return (
    <div className={`${maxWidth} w-full mx-auto px-4 md:px-8 ${noPaddingTop ? '' : 'pt-6 md:pt-8'} pb-20 text-foreground`}>
      {(title || description) && (
        <div className="mb-8 ml-1">
          {title && (
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {title}
            </h1>
          )}
          {description && <p className="text-[14px] text-text-sub mt-2 font-bold">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
