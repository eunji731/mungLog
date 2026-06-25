import React from 'react';
import type { CareRecord } from '@/types/care';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getImagePath } from '@/app/common/lib/clientApi';
import { usePet } from '@/app/common/hooks/usePet';

interface CareRecordDetailHeaderProps {
  record: CareRecord;
  onDelete: () => void;
}

export const CareRecordDetailHeader: React.FC<CareRecordDetailHeaderProps> = ({ record, onDelete }) => {
  const router = useRouter();
  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  const { pets } = usePet();

  const recordTypeCode = String(record.recordType || '');
  const isMedical = isMedicalRecordType(recordTypeCode);

  // usePetStore에서 일치하는 반려견의 프로필 이미지(photo)를 조회
  const matchedDog = pets.find(p => String(p.id) === String(record.dogId || record.petId));
  const dogProfileUrl = matchedDog?.photo || record.dogProfileImageUrl;

  return (
    <header className="space-y-4">
      {/* Back Button & Date */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/care-records')}
          className="flex items-center gap-2 text-text-sub hover:text-text-main text-[13px] font-black transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>목록으로 돌아가기</span>
        </button>
        
        <div className="flex items-center gap-1.5 text-text-sub font-bold text-[13px] tabular-nums">
          <Calendar className="w-4 h-4 text-main-green" />
          <span>
            {new Date(record.recordDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </span>
        </div>
      </div>

      {/* Hero Title Section with modern gradient glassmorphism vibe */}
      <div className="relative overflow-hidden bg-gradient-to-r from-light-green/20 via-background to-light-yellow/15 dark:from-zinc-900/50 dark:to-zinc-900/10 border border-border p-6 md:p-8 rounded-[32px] shadow-xs">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 bg-main-green/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border
                ${isMedical 
                  ? 'border-main-green/30 text-main-green bg-main-green/5 dark:bg-main-green/10' 
                  : 'border-border text-text-sub bg-background dark:bg-zinc-800 shadow-xs'
                }`}>
                {recordTypes.find(t => t.code === recordTypeCode)?.codeName || recordTypeCode || '기록'}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-text-main leading-[1.2] lg:leading-[1.1] tracking-tight pr-4 break-keep">
              {record.title}<span className="text-main-green">.</span>
            </h1>
          </div>

          {/* Dog Avatar Widget */}
          <div className="flex items-center gap-3 bg-background dark:bg-zinc-800 border border-border px-4 py-2.5 rounded-2xl shadow-xs self-start md:self-center shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-green border border-border shadow-xs flex items-center justify-center shrink-0">
              {dogProfileUrl ? (
                <img src={getImagePath(dogProfileUrl, 'profiles')} alt={record.dogName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[14px]">🐕</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[9px] font-black text-text-sub uppercase tracking-wider">Family</p>
              <span className="text-[14px] font-black text-text-main tracking-tight">{record.dogName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
