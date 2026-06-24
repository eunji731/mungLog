import React from 'react';
import { useRouter } from 'next/navigation';
import type { Dog } from '@/types/dog';
import { Card } from '@/components/common/Card';

interface DogSummaryCardProps {
  dog: Dog;
}

export const DogSummaryCard: React.FC<DogSummaryCardProps> = ({ dog }) => {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push('/family')}
      className="p-6 transition-all duration-500 hover:shadow-md border border-border group"
    >
      <div className="flex items-center gap-6">
        {/* 썸네일 영역 - 크기 확대 및 정밀화 */}
        <div className="w-24 h-24 rounded-[24px] overflow-hidden bg-surface-green flex items-center justify-center border border-border shrink-0 group-hover:border-main-green/30 transition-colors">
          {dog.profileImageUrl ? (
            <img src={dog.profileImageUrl} alt={dog.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all">🐕</span>
          )}
        </div>

        {/* 정보 영역 - 위계 선명화 */}
        <div className="flex-grow min-w-0 py-1">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[22px] font-black text-foreground truncate tracking-tight group-hover:text-main-green transition-colors">
              {dog.name}
            </h4>
            <div className="w-8 h-8 rounded-full bg-surface-green flex items-center justify-center text-text-sub/50 group-hover:bg-main-green/10 group-hover:text-main-green transition-all">
              <span className="text-lg">→</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-bold text-text-sub truncate">
              {dog.breed || '품종 미등록'}
            </p>
            <p className="text-[13px] font-medium text-text-sub/80">
              {dog.weight ? `${dog.weight}kg` : '몸무게 미등록'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
