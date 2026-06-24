import React from 'react';
import type { CareRecord } from '@/types/care';
import { Card } from '@/components/common/Card';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface CareRecordSummaryProps {
  record: CareRecord;
}

export const CareRecordSummary: React.FC<CareRecordSummaryProps> = ({ record }) => {
  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  const { getCodeName: getCategoryName } = useCommonCodes('EXPENSE_CATEGORY');
  
  let recordTypeCode = String((record as any).recordType || '');
  if (record.recordTypeId) {
    recordTypeCode = recordTypes.find(t => t.id === record.recordTypeId)?.code || recordTypeCode;
  }
  const isMedical = recordTypeCode === 'MEDICAL';

  return (
    <Card className="p-8 lg:p-10 mb-10 overflow-hidden border-none ring-1 ring-[#F0F0F0] shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
        
        {/* Dog Information */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-stone-50 border-2 border-white shadow-md ring-1 ring-stone-100 shrink-0 flex items-center justify-center">
            {record.dogProfileImageUrl ? (
              <img src={record.dogProfileImageUrl} alt={record.dogName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl grayscale opacity-30">🐕</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-black text-stone-300 uppercase tracking-widest">Target Dog</p>
            <h3 className="text-[24px] font-black text-[#2D2D2D] tracking-tight">{record.dogName}</h3>
          </div>
        </div>

        {/* Amount Area */}
        {record.amount !== undefined && record.amount !== null && (
          <div className="grow xl:grow-0 flex items-center gap-10 xl:pl-10 xl:border-l border-stone-100">
            <div className="text-right py-4 px-10 bg-[#FCFAF8] rounded-[24px] border border-[#F5F5F5] w-full xl:w-auto shadow-inner">
              <p className="text-[11px] font-black text-stone-300 uppercase tracking-widest mb-1">Total Amount</p>
              <span className="text-[32px] font-black text-[#2D2D2D] tabular-nums tracking-tighter">
                {record.amount.toLocaleString()}
                <span className="text-[18px] ml-1.5 text-stone-400 font-bold">원</span>
              </span>
            </div>
          </div>
        )}

        {/* Category / Clinic Area */}
        <div className="flex items-center gap-6 xl:pl-10 xl:border-l border-stone-100 min-w-[200px]">
          <div className="space-y-1">
            <p className="text-[12px] font-black text-stone-300 uppercase tracking-widest">
              {isMedical ? 'Clinic Name' : 'Category'}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isMedical ? '🏥' : '🏷️'}</span>
              <h3 className="text-[20px] font-bold text-stone-600 tracking-tight">
                {isMedical ? (record.clinicName || 'Clinic Name') : getCategoryName(String(record.categoryCode || (record as any).categoryId || record.categoryTypeId || ''))}
              </h3>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};
