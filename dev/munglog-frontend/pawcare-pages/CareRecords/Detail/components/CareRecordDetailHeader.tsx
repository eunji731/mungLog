import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CareRecord } from '@/types/care';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface CareRecordDetailHeaderProps {
  record: CareRecord;
  onDelete: () => void;
}

export const CareRecordDetailHeader: React.FC<CareRecordDetailHeaderProps> = ({ record, onDelete }) => {
  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  
  let recordTypeCode = String((record as any).recordType || '');
  if (record.recordTypeId) {
    recordTypeCode = recordTypes.find(t => t.id === record.recordTypeId)?.code || recordTypeCode;
  }
  const isMedical = recordTypeCode === 'MEDICAL';

  // 프로필 이미지 URL (snake_case 및 중첩 필드 대응)
  const raw = record as any;
  const dogProfileUrl = record.dogProfileImageUrl || raw.dog_profile_image_url;

  return (
    <header className="pb-2">
      {/* Main Title & Tags */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase border
            ${isMedical ? 'border-[#FF6B00]/30 text-[#FF6B00] bg-[#FF6B00]/5' : 'border-stone-200 text-stone-500 bg-white shadow-sm'}`}>
            {recordTypes.find(t => t.code === recordTypeCode)?.codeName || recordTypeCode || '기록'}
          </span>
          <span className="text-[13px] font-black text-stone-400 tabular-nums ml-1 tracking-widest">
            {new Date(record.recordDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).replace(/\. /g, '.').replace(/\.$/, '')}
          </span>
        </div>
        
        <h1 className="text-[36px] md:text-[44px] font-black text-[#2D2D2D] leading-[1.2] lg:leading-[1.1] tracking-tight word-break-keep-all pr-4">
          {record.title}<span className="text-[#FF6B00]">.</span>
        </h1>

        {/* Dog Avatar */}
        <div className="flex items-center gap-2 pt-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-stone-200 shadow-sm flex items-center justify-center shrink-0">
            {dogProfileUrl ? (
              <img src={dogProfileUrl} alt={record.dogName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[12px] grayscale opacity-40">🐕</span>
            )}
          </div>
          <span className="text-[15px] font-black text-[#2D2D2D] tracking-tight">{record.dogName}</span>
        </div>

      </div>
    </header>
  );
};
