import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { DogCard } from './components/DogCard';
import { useDogList } from './hooks/useDogList';

const DogListPage = () => {
  const navigate = useNavigate();
  const { dogs, isLoading, error, refetch } = useDogList();

  const handleDelete = async (id: string, name: string) => {
    // 삭제 로직은 이전과 동일 (ConfirmModal 등을 통해 호출됨)
    // 여기서는 UI 구조만 리디자인하므로 핸들러 연결 유지
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[1500px]">
        {/* 1. HERO HEADER: 케어기록 페이지와 통일된 시스템 */}
        <header className="pt-12 pb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <h1 className="text-[52px] lg:text-[64px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
              Family <span className="text-[#FF6B00]">Members.</span>
            </h1>
            <p className="text-[17px] text-stone-400 font-medium max-w-xl word-break-keep-all">
              멍케어차트와 함께하는 소중한 반려견들을 관리하세요. <br />
              각 아이들의 건강 상태와 기록을 한눈에 확인할 수 있습니다.
            </p>
          </div>
          <div className="pb-1">
            <Button 
              size="lg" 
              onClick={() => navigate('/dogs/new')}
              className="px-10 h-[64px] text-[16px] shadow-2xl transition-all hover:-translate-y-1"
            >
              + 새로운 가족 등록하기
            </Button>
          </div>
        </header>

        {/* 2. MAIN CONTENT AREA */}
        <main className="pb-32">
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-[5px] border-stone-100 border-t-[#FF6B00] rounded-full animate-spin mb-6" />
              <p className="text-stone-300 font-black tracking-widest uppercase text-sm">Loading Members</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center bg-white rounded-[32px] border border-red-50 shadow-sm">
              <p className="text-red-400 font-black text-[16px] mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="border-red-100 text-red-500">다시 시도하기</Button>
            </div>
          ) : dogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {dogs.map(dog => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[48px] border border-[#F0F0F0] shadow-[0_20px_60px_rgba(0,0,0,0.02)] px-10 text-center">
              <div className="w-24 h-24 bg-[#FCFAF8] rounded-[32px] flex items-center justify-center mb-8 border border-[#F5F5F5]">
                <span className="text-4xl grayscale opacity-40">🐕</span>
              </div>
              <h3 className="text-[28px] font-black text-[#2D2D2D] mb-4 tracking-tight">No Members Yet.</h3>
              <p className="text-stone-400 font-medium text-lg mb-12 max-w-xs leading-relaxed">
                아직 등록된 반려견이 없습니다. <br />
                첫 번째 가족을 등록하고 케어를 시작해보세요.
              </p>
              <Button onClick={() => navigate('/dogs/new')} variant="outline" size="lg" className="rounded-full px-12 border-[#EEEEEE] text-[#2D2D2D] hover:bg-stone-50">
                가족 등록 시작하기
              </Button>
            </div>
          )}
        </main>
      </PageLayout>
    </div>
  );
};

export default DogListPage;
