import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { DogCard } from '@/features/pets/components/DogCard';
import { usePet } from '@/app/common/hooks/usePet';

const DogListPage = () => {
  const router = useRouter();
  const { pets: dogs, loading: isLoading, error } = usePet();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Family Members</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">반려견 정보</h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">PetLifeLog와 함께하는 소중한 반려견들의 프로필을 관리하세요.</p>
          </div>
          <div className="shrink-0">
            <Button
              size="md"
              onClick={() => router.push('/dogs/new')}
              className="px-6 h-[48px] text-[14px] font-black rounded-2xl"
            >
              + 새로운 가족 등록하기
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="h-[300px] flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin mb-4" />
              <p className="text-text-sub font-black tracking-widest uppercase text-xs">Loading Members</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center bg-background rounded-3xl border border-border shadow-sm px-6">
              <p className="text-red-500 font-bold text-[14px] mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="border-border text-foreground hover:bg-surface-green">다시 시도하기</Button>
            </div>
          ) : dogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {dogs.map(dog => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center bg-background rounded-3xl border border-border shadow-sm px-6 text-center">
              <div className="w-16 h-16 bg-surface-green/20 rounded-2xl flex items-center justify-center mb-6 border border-border">
                <span className="text-3xl grayscale opacity-40">🐕</span>
              </div>
              <h3 className="text-[20px] font-black text-foreground mb-2 tracking-tight">No Members Yet.</h3>
              <p className="text-text-sub font-medium text-sm mb-6 max-w-xs leading-relaxed">
                아직 등록된 반려견이 없습니다. <br />
                첫 번째 가족을 등록하고 케어를 시작해보세요.
              </p>
              <Button onClick={() => router.push('/dogs/new')} variant="outline" size="md" className="rounded-xl px-8 border-border text-foreground hover:bg-surface-green">
                가족 등록 시작하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DogListPage;
