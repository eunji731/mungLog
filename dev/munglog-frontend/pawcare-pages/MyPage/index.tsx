import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { DogSummaryCard } from './components/DogSummaryCard';
import type { Dog } from '@/types/dog';
import { dogApi } from '@/api/dogApi';

export const MyPage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoadingDogs, setIsLoadingDogs] = useState(true);

  useEffect(() => {
    const fetchMyDogs = async () => {
      try {
        setIsLoadingDogs(true);
        const data = await dogApi.getDogs();
        setDogs(data || []);
      } catch (err) {
        console.error('마이페이지 반려견 로드 실패:', err);
        setDogs([]);
      } finally {
        setIsLoadingDogs(false);
      }
    };
    fetchMyDogs();
  }, []);

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[1400px]">
        {/* 1. 페이지 헤더 - 한국어 중심 */}
        <header className="pt-8 pb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-stone-100 mb-12">
          <div className="space-y-3">
            <h1 className="text-[42px] font-black text-[#2D2D2D] tracking-tight leading-none">
              내 프로필<span className="text-[#FF6B00]">.</span>
            </h1>
            <p className="text-[16px] text-stone-400 font-medium">
              계정 정보와 등록된 가족들을 관리합니다.
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-32">

          {/* 2. 좌측: 컴팩트 계정 정보 (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[28px] p-8 border border-[#F0F0F0] shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[17px] font-black text-[#2D2D2D]">계정 정보</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[13px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                >
                  {isEditing ? '취소' : '수정'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-black text-stone-300 uppercase tracking-widest">Email</p>
                  <p className="text-[15px] font-bold text-[#2D2D2D]">{user?.email}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-black text-stone-300 uppercase tracking-widest">Name</p>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-grow h-10 py-2"
                      />
                      <Button onClick={handleSaveProfile} size="sm" className="shrink-0 rounded-lg">저장</Button>
                    </div>
                  ) : (
                    <p className="text-[18px] font-black text-[#2D2D2D]">{user?.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-black text-stone-300 uppercase tracking-widest">Role</p>
                  <Badge color="stone" className="px-3 py-0.5 rounded-lg opacity-70">
                    {user?.type_id || 'MEMBER'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 계정 관리 액션 */}
            <div className="bg-white rounded-[24px] p-2 border border-[#F0F0F0] flex flex-col">
              <button className="w-full py-3 text-[13px] font-bold text-stone-500 hover:text-[#2D2D2D] hover:bg-stone-50 rounded-2xl transition-all">
                비밀번호 변경
              </button>
              <button
                onClick={logout}
                className="w-full py-3 text-[13px] font-bold text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 3. 우측: 메인 반려견 아카이브 (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[24px] font-black text-[#2D2D2D] tracking-tight">함께하는 가족</h3>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dogs/new'}
                className="rounded-xl border-[#EEEEEE] hover:border-[#FF6B00] text-stone-600 font-bold px-5 h-11"
              >
                + 새 가족 추가
              </Button>
            </div>

            {isLoadingDogs ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-stone-100 border-t-[#FF6B00] rounded-full animate-spin" />
              </div>
            ) : dogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {dogs.map(dog => (
                  <DogSummaryCard key={dog.id} dog={dog} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center bg-white rounded-[32px] border-2 border-dashed border-stone-100 flex flex-col items-center">
                <span className="text-5xl mb-4 grayscale opacity-20">🐕</span>
                <p className="text-stone-400 font-bold">아직 등록된 가족이 없습니다.</p>
              </div>
            )}
          </div>

        </main>
      </PageLayout>
    </div>
  );
};
