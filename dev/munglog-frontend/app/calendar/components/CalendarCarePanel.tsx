'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar } from 'lucide-react';
import type { CareRecord } from '@/types/care';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { Button } from '@/components/common/Button';

interface CalendarCarePanelProps {
  date: Date;
  careRecords: CareRecord[];
  onClose: () => void;
  onAddNew?: () => void;
}

export default function CalendarCarePanel({ date, careRecords, onClose, onAddNew }: CalendarCarePanelProps) {
  const router = useRouter();
  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  const { getCodeNameById } = useCommonCodes('EXPENSE_CATEGORY');

  const formattedDate = React.useMemo(() => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }, [date]);

  const displayDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  const filteredRecords = React.useMemo(() => {
    return careRecords.filter(r => r.recordDate === formattedDate);
  }, [careRecords, formattedDate]);

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      router.push('/care-records/new');
    }
  };

  const getTypeName = (record: CareRecord) => {
    const typeCode = String(record.recordType || '');
    return recordTypes.find(t => t.code === typeCode)?.codeName || typeCode || '기록';
  };

  const getCategoryName = (record: CareRecord) => {
    return record.categoryTypeId ? getCodeNameById(record.categoryTypeId) : (record.categoryCode || '지출');
  };

  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto no-scrollbar bg-surface-green/20">
        <div className="max-w-4xl mx-auto min-h-full bg-background shadow-2xl flex flex-col items-center justify-center p-10 text-center space-y-6">
          <div className="w-24 h-24 bg-surface-green rounded-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-main-green opacity-40" />
          </div>
          <div>
            <h3 className="text-xl font-black text-text-main">아직 기록이 없어요</h3>
            <p className="text-text-sub font-bold mt-2 leading-relaxed">이날 기록된 건강/지출 케어가 없습니다.<br/>새로운 케어 기록을 작성해보세요.</p>
          </div>
          <Button 
            variant="outline" 
            size="md" 
            onClick={handleAddNew}
            className="rounded-xl border-border text-foreground hover:bg-surface-green px-6"
          >
            기록 작성하기
          </Button>
        </div>
      </div>
    </div>
  );

  if (filteredRecords.length === 0) return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden relative shadow-[-12px_0_32px_rgba(0,0,0,0.03)]">
      <div className="sticky top-0 z-[20] bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 lg:px-5 lg:py-3.5 flex justify-between items-center shadow-sm shrink-0">
        <h2 className="text-base lg:text-lg font-bold text-text-main tracking-tight">{displayDate}</h2>
        <button onClick={onClose} className="p-2 hover:bg-surface-green rounded-xl transition-all">
          <X className="w-6 h-6 text-text-sub" />
        </button>
      </div>
      {renderEmptyState()}
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden shadow-[-12px_0_32px_rgba(0,0,0,0.03)] relative">
      {/* Header */}
      <div className="sticky top-0 z-[20] bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 lg:px-5 lg:py-3.5 flex justify-between items-center shadow-sm shrink-0">
        <h2 className="text-base lg:text-lg font-bold text-text-main tracking-tight">{displayDate}</h2>
        <button onClick={onClose} className="p-2 hover:bg-surface-green rounded-xl transition-all">
          <X className="w-6 h-6 text-text-sub" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-surface-green/20 space-y-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-2">
          <span className="text-xs font-bold text-text-sub">총 {filteredRecords.length}개의 기록</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddNew}
            className="rounded-xl border-border hover:border-main-green text-foreground hover:bg-surface-green text-xs px-3 h-8 shadow-sm"
          >
            + 기록 추가
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredRecords.map((record) => {
            const isMed = isMedicalRecordType(record.recordType);

            return (
              <div 
                key={record.id}
                onClick={() => router.push(`/care-records/${record.id}`)}
                className="group flex flex-col p-6 bg-background rounded-[24px] border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase border shrink-0 ${
                    isMed ? 'bg-main-green text-white border-main-green' : 'bg-surface-green text-text-sub border-border'
                  }`}>
                    {getTypeName(record)}
                  </span>
                  {record.amount !== undefined && record.amount !== null && (
                    <span className="text-[16px] lg:text-[18px] font-black text-foreground tabular-nums">
                      {record.amount.toLocaleString()}원
                    </span>
                  )}
                </div>

                <h4 className="text-[17px] font-black text-foreground tracking-tight leading-snug mb-4 group-hover:text-main-green transition-colors">
                  {record.title}
                </h4>

                <div className="flex items-center gap-3 pt-3 border-t border-border mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-green border border-border shrink-0 flex items-center justify-center">
                      {record.dogProfileImageUrl ? (
                        <img src={record.dogProfileImageUrl} alt={record.dogName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] grayscale opacity-40">🐕</span>
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-foreground">
                      {record.dogName}
                    </span>
                  </div>

                  <span className="w-px h-3 bg-border" />

                  <span className="text-[12px] font-bold text-text-sub flex items-center gap-1">
                    {isMed ? '🏥' : '🏷️'} {isMed ? (record.clinicName || '진료기록') : getCategoryName(record)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
