import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';
import { DogSummaryCard } from './components/DogSummaryCard';
import type { Dog } from '@/types/dog';
import { dogApi } from '@/api/dogApi';

export const MyPage = () => {
  const navigate = useNavigate();
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
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">My Page</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">마이페이지</h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">계정 정보와 등록된 소중한 반려견 목록을 한눈에 관리하세요.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-7xl mx-auto">
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* 좌측: 컴팩트 계정 정보 (4/12) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-background rounded-3xl p-6 border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[16px] font-black text-foreground">계정 정보</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[13px] font-bold text-main-green hover:underline cursor-pointer"
                  >
                    {isEditing ? '취소' : '수정'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Email</p>
                    <p className="text-[14px] font-bold text-foreground">{user?.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Name</p>
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
                      <p className="text-[16px] font-black text-foreground">{user?.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Role</p>
                    <Badge color="stone" className="px-3 py-0.5 rounded-lg opacity-70">
                      {user?.type_id || 'MEMBER'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 계정 관리 액션 */}
              <div className="bg-background rounded-3xl p-2 border border-border flex flex-col">
                <button className="w-full py-3 text-[13px] font-bold text-text-sub hover:text-foreground hover:bg-surface-green rounded-2xl transition-all">
                  비밀번호 변경
                </button>
                <button
                  onClick={logout}
                  className="w-full py-3 text-[13px] font-bold text-red-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                >
                  로그아웃
                </button>
              </div>
            </div>

            {/* 우측: 메인 반려견 아카이브 (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[20px] font-black text-foreground tracking-tight">함께하는 가족</h3>
                <Button
                  variant="outline"
                  onClick={() => navigate('/family')}
                  className="rounded-xl border-border hover:border-main-green text-foreground hover:bg-surface-green font-bold px-4 h-10 text-xs"
                >
                  + 새 가족 추가
                </Button>
              </div>

              {isLoadingDogs ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-border border-t-main-green rounded-full animate-spin" />
                </div>
              ) : dogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {dogs.map(dog => (
                    <DogSummaryCard key={dog.id} dog={dog} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-background rounded-3xl border border-border flex flex-col items-center">
                  <span className="text-4xl mb-3 grayscale opacity-20">🐕</span>
                  <p className="text-text-sub text-sm font-bold">아직 등록된 가족이 없습니다.</p>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};
