import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, Search, X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { parseISO } from 'date-fns';
import { Button } from '@/components/common/Button';
import TimelineDatePicker from '@/features/calendar/components/TimelineDatePicker';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { usePet, ALL_PETS_ID } from '@/app/common/hooks/usePet';
import { useCareRecords } from '../hooks/useCareRecords';
import { TimelineItem } from '../components/TimelineItem';
import SymptomSnapboard from '../components/SymptomSnapboard';

interface CareRecordListPageProps {
  showHeader?: boolean;
}

const CareRecordListPage = ({ showHeader = true }: CareRecordListPageProps) => {
  const router = useRouter();
  const { records, isLoading, filters, updateFilter, refetch } = useCareRecords();
  const { pets, selectedPetId } = usePet();
  const { codes: allRecordTypes } = useCommonCodes('RECORD_TYPE');
  const recordTypes = allRecordTypes.filter(t => t.code !== 'MEMO');

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const petDisplayName = selectedPetId === ALL_PETS_ID ? '가족' : (selectedPet?.name || '아이');

  const [localKeyword, setLocalKeyword] = useState(filters.keyword ?? '');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalKeyword(filters.keyword ?? '');
  }, [filters.keyword]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateFilter({ keyword: localKeyword || undefined });
    }
  };

  const startDate = filters.startDate ? parseISO(filters.startDate) : null;
  const endDate = filters.endDate ? parseISO(filters.endDate) : null;
  const hasDateFilter = Boolean(filters.startDate || filters.endDate);

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-background text-text-main">
      <div className="w-full relative">

        {showHeader && (
          <div className="sticky top-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-border">
            <div className="w-full px-4 md:px-10 h-16 flex items-center justify-between gap-3 md:gap-8">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 bg-main-green/10 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-main-green" />
                </div>
                <h1 className="text-lg font-black tracking-tight whitespace-nowrap">
                  {petDisplayName}<span className="text-main-green"> 케어기록</span>
                </h1>
              </div>

              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto no-scrollbar">
                <button
                  onClick={() => updateFilter({ type: 'ALL', recordTypeId: undefined })}
                  className={`px-4 py-1.5 text-[11px] font-black rounded-full transition-all whitespace-nowrap ${
                    filters.type === 'ALL' && !filters.recordTypeId
                      ? 'bg-main-green/10 text-main-green'
                      : 'text-text-sub hover:text-main-green hover:bg-main-green/5'
                  }`}
                >
                  전체
                </button>
                {recordTypes.map((type) => {
                  const isActive = filters.recordTypeId === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateFilter({ type: type.code as any, recordTypeId: type.id })}
                      className={`px-4 py-1.5 text-[11px] font-black rounded-full transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-main-green/10 text-main-green'
                          : 'text-text-sub hover:text-main-green hover:bg-main-green/5'
                      }`}
                    >
                      {type.codeName}
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center bg-surface-green/50 rounded-full px-3 md:px-4 py-2 border border-transparent focus-within:border-main-green/30 focus-within:bg-background transition-all shadow-sm w-[150px] md:w-[220px] shrink-0">
                  <Search className="w-4 h-4 text-text-sub mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="기록 검색..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-[11px] font-bold text-text-main placeholder:text-text-sub/40 min-w-0"
                    value={localKeyword}
                    onChange={(e) => setLocalKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {localKeyword && (
                    <button onClick={() => { setLocalKeyword(''); updateFilter({ keyword: undefined }); }} className="ml-2 shrink-0">
                      <X className="w-3.5 h-3.5 text-text-sub hover:text-red-500" />
                    </button>
                  )}
                </div>

                <div className="relative" ref={dateFilterRef}>
                  <button
                    onClick={() => setShowDateFilter(prev => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-black transition-all border ${
                      hasDateFilter
                        ? 'bg-main-green/10 text-main-green border-main-green/30'
                        : 'bg-surface-green/50 text-text-sub border-transparent hover:text-main-green'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{hasDateFilter ? '기간 설정됨' : '기간'}</span>
                  </button>

                  {showDateFilter && (
                    <div className="absolute top-full right-0 mt-2 w-[340px] bg-background border border-border shadow-2xl rounded-[28px] p-4 z-[110] animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <TimelineDatePicker
                            value={filters.startDate || ''}
                            onChange={(date) => {
                              if (date && filters.endDate && date > filters.endDate) {
                                alert('시작일은 종료일보다 늦을 수 없습니다.');
                                return;
                              }
                              updateFilter({ startDate: date || undefined });
                            }}
                            label="시작일"
                            variant="button"
                          />
                        </div>
                        <span className="text-text-sub font-light shrink-0">~</span>
                        <div className="flex-1">
                          <TimelineDatePicker
                            value={filters.endDate || ''}
                            onChange={(date) => {
                              if (date && filters.startDate && date < filters.startDate) {
                                alert('종료일은 시작일보다 빠를 수 없습니다.');
                                return;
                              }
                              updateFilter({ endDate: date || undefined });
                            }}
                            label="종료일"
                            variant="button"
                          />
                        </div>
                      </div>
                      {hasDateFilter && (
                        <button
                          onClick={() => updateFilter({ startDate: undefined, endDate: undefined })}
                          className="mt-3 w-full text-[11px] font-black text-text-sub hover:text-main-green transition-colors text-center"
                        >
                          기간 초기화
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-4 shadow-md shadow-main-green/20 gap-1.5"
                  onClick={() => router.push('/care-records/new')}
                >
                  <Plus className="w-3.5 h-3.5" /> 기록하기
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 md:px-8 pt-8 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Symptom Snapboard */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <SymptomSnapboard timelineRecords={records} onSnapLinked={refetch} />
            </div>

            {/* Right Column: Timeline list */}
            <div className="lg:col-span-8">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
                </div>
              ) : records.length > 0 ? (
                <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                  {records.map(record => (
                    <TimelineItem key={record.id} record={record} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in zoom-in duration-700">
                  <div className="w-20 h-20 bg-surface-green/50 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-main-green/30" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-text-main">기록된 케어가 없습니다</h3>
                    <p className="text-xs font-bold text-text-sub">반려견의 건강 기록과 지출을 남겨보세요.</p>
                  </div>
                  <Button variant="outline" size="md" className="rounded-xl px-8 border-border text-foreground hover:bg-surface-green" onClick={() => router.push('/care-records/new')}>
                    기록 시작하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareRecordListPage;
