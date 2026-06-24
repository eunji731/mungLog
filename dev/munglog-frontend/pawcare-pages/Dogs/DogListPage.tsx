import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { DogCard } from '@/pages/Dogs/List/components/DogCard';
import type { Dog } from '@/types/dog';
import { dogApi } from '@/api/dogApi';

export const DogListPage = () => {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        setIsLoading(true);
        const data = await dogApi.getDogs();
        setDogs(data);
      } catch (err: any) {
        setError(err.response?.data?.message || '목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDogs();
  }, []);

  return (
    <PageLayout
      title="반려견 목록"
      description="함께하는 소중한 가족들을 관리합니다."
    >
      <div className="flex justify-end mb-8">
        <Button
          onClick={() => navigate('/dogs/new')}
          variant="primary"
        >
          <span className="text-lg mr-1">+</span> 새 반려견 등록
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <p className="text-text-sub font-black animate-pulse text-[15px]">데이터를 불러오는 중입니다... 🐾</p>
        </div>
      ) : error ? (
        <div className="py-24 text-center bg-red-500/5 rounded-3xl border border-red-500/10">
          <p className="text-red-500 font-black text-[15px]">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-red-500/20 text-red-500 hover:bg-red-500/10">다시 시도</Button>
        </div>
      ) : dogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {dogs.map(dog => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-background rounded-3xl border-2 border-dashed border-main-green/20">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-xl font-black text-foreground mb-2">등록된 반려견이 없어요</h3>
          <p className="text-text-sub font-bold mb-8">첫 번째 반려견을 등록하고 케어를 시작해보세요!</p>
          <Button onClick={() => navigate('/dogs/new')} variant="outline">
            지금 등록하기
          </Button>
        </div>
      )}
    </PageLayout>
  );
};
