import React from 'react';
import { Header } from '@/pages/Home/components/Header';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  noPaddingTop?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, description, children, maxWidth = 'max-w-4xl', noPaddingTop = false }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 pb-20">
      <Header />
      <div className={`${maxWidth} mx-auto px-4 md:px-8 ${noPaddingTop ? '' : 'pt-8 md:pt-12'}`}>
        {(title || description) && (
          <div className="mb-8 ml-1">
            {title && (
              <h1 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight">
                {title}
              </h1>
            )}
            {description && <p className="text-[14px] text-stone-400 mt-2 font-bold">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
