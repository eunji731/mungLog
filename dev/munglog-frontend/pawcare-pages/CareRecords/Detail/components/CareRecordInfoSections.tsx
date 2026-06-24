import React from 'react';
import { useNavigate } from 'react-router-dom';
import { parseISO, addDays, isBefore, startOfDay, format } from 'date-fns';
import type { CareRecord } from '@/types/care';
import { useCommonCodes } from '@/hooks/useCommonCodes';

interface CareRecordInfoSectionsProps {
  record: CareRecord;
}

export const CareRecordInfoSections: React.FC<CareRecordInfoSectionsProps> = ({ record }) => {
  const navigate = useNavigate();
  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  
  let recordTypeCode = String((record as any).recordType || '');
  if (record.recordTypeId) {
    recordTypeCode = recordTypes.find(t => t.id === record.recordTypeId)?.code || recordTypeCode;
  }

  const isMedical = recordTypeCode === 'MEDICAL';
  const isExpense = recordTypeCode === 'EXPENSE';

  // 카테고리명 변환을 위한 훅 (ID 기반 조회 헬퍼 포함)
  const { getCodeNameById } = useCommonCodes('EXPENSE_CATEGORY');
  
  const rawRecord = record as any;
  const getField = (camelField: string, snakeField: string) => 
    rawRecord[camelField] ?? 
    rawRecord[snakeField] ?? 
    rawRecord.medicalDetails?.[camelField] ?? 
    rawRecord.medical_details?.[snakeField] ??
    rawRecord.medicalDetails?.[snakeField] ??
    rawRecord.medical_details?.[camelField] ??
    rawRecord.expenseDetails?.[camelField] ??
    rawRecord.expense_details?.[snakeField];

  const medDays = Number(getField('medicationDays', 'medication_days') || 0);
  const medStart = getField('medicationStartDate', 'medication_start_date');
  
  const relatedMedical = record.relatedMedicalRecord || rawRecord.related_medical_record || rawRecord.expenseDetails?.relatedMedicalRecord || rawRecord.expense_details?.related_medical_record;

  let medStatus = record.medicationStatus;

  let medEndDateStr = '';
  if (medStart && medDays > 0) {
    try {
      const startDate = parseISO(medStart);
      const medEndDate = addDays(startDate, medDays - 1);
      medEndDateStr = format(medEndDate, 'yyyy-MM-dd');
      const completionDate = addDays(startDate, medDays);
      const today = startOfDay(new Date());
      
      if (!isBefore(today, completionDate)) {
        medStatus = 'COMPLETED';
      } else {
        medStatus = 'ACTIVE';
      }
    } catch (e) {
      console.error('Date calculation error:', e);
    }
  } 

  if (!medStatus || medStatus === 'NONE') {
    const isMedCompletedRaw = rawRecord.is_medication_completed ?? rawRecord.medicalDetails?.is_medication_completed ?? rawRecord.medical_details?.is_medication_completed;
    if (isMedCompletedRaw !== undefined && isMedCompletedRaw !== null) {
        medStatus = isMedCompletedRaw ? 'COMPLETED' : 'ACTIVE';
    } else if (medDays > 0) {
        medStatus = 'ACTIVE';
    }
  }

  // 지출 카테고리 ID 추출 및 명칭 변환
  const categoryId = record.categoryTypeId || rawRecord.category_type_id || rawRecord.categoryId || rawRecord.category_id;
  const categoryDisplayName = categoryId ? getCodeNameById(Number(categoryId)) : (record.categoryCode || '-');

  return (
    <div className="flex flex-col gap-4">
      
      <div className={`flex flex-col md:grid gap-3 lg:gap-4 ${isMedical ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        
        {record.amount !== undefined && record.amount !== null && (
          <div className="bg-[#FF6B00] rounded-[24px] p-6 lg:p-7 flex flex-row md:flex-col justify-between items-center md:items-start md:min-h-[140px] shadow-lg shadow-[#FF6B00]/20">
            <span className="text-white/70 text-[10px] font-black uppercase tracking-widest opacity-90">Total Amount</span>
            <div className="mt-0 md:mt-4 flex items-end">
              <span className="text-white text-[24px] md:text-[32px] font-black tracking-tighter tabular-nums leading-none">
                {record.amount.toLocaleString()}
              </span>
              <span className="text-white/80 text-[12px] font-bold ml-1 mb-0.5 md:mb-0">원</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[24px] p-6 lg:p-7 flex flex-row md:flex-col justify-between items-center md:items-start md:min-h-[140px] shadow-sm border border-stone-200/60">
          <span className="text-stone-400 text-[11px] font-black uppercase tracking-widest">
             {isMedical ? '방문 병원' : '지출 카테고리'}
          </span>
          <div className="mt-0 md:mt-4 text-[#2D2D2D] text-[16px] md:text-[20px] font-black tracking-tight leading-snug break-keep">
            {isMedical ? (record.clinicName || '-') : categoryDisplayName}
          </div>
        </div>

        {isMedical && (
          <div className="bg-white rounded-[24px] p-6 lg:p-7 flex flex-row md:flex-col justify-between items-center md:items-start md:min-h-[140px] shadow-sm border border-stone-200/60">
            <span className="text-stone-400 text-[11px] font-black uppercase tracking-widest">진단 / 치료명</span>
            <div className="mt-0 md:mt-4 text-[#2D2D2D] text-[16px] md:text-[20px] font-black tracking-tight leading-snug break-keep">
              {record.diagnosis || '-'}
            </div>
          </div>
        )}
      </div>

      {isExpense && relatedMedical && (
        <div 
          onClick={() => navigate(`/care-records/${relatedMedical.id}`)}
          className="group bg-white rounded-[24px] p-6 shadow-sm border border-stone-200/60 cursor-pointer hover:border-[#FF6B00] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-1 bg-[#FF6B00] rounded-full" /> 연관된 진료 정보
              </span>
              <h4 className="text-[16px] font-black text-stone-800 group-hover:text-[#FF6B00] transition-colors">
                [{relatedMedical.recordDate}] {relatedMedical.title || relatedMedical.clinicName || '진료 기록'}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-tighter group-hover:text-[#FF6B00]">상세보기</span>
              <span className="text-stone-300 group-hover:text-[#FF6B00] transition-colors text-xl">→</span>
            </div>
          </div>
        </div>
      )}

      {isMedical && medStatus && medStatus !== 'NONE' && (
        <div className={`rounded-[24px] p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-5 border shadow-sm
          ${medStatus === 'ACTIVE' ? 'bg-[#FF6B00]/5 border-[#FF6B00]/20' : 'bg-green-50/50 border-green-200/50'}
        `}>
          <div className="flex items-start md:items-center gap-4 md:pl-2">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[20px] shadow-sm shrink-0 border bg-white
              ${medStatus === 'ACTIVE' ? 'text-[#FF6B00] border-orange-100' : 'text-green-600 border-green-100'}`}>
              💊
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Medication Status</span>
               <span className="text-[14px] md:text-[15px] font-black text-[#2D2D2D] mt-0.5">
                 {medStart && medDays > 0 && medEndDateStr
                   ? `${medStart} ~ ${medEndDateStr} (${medDays}일간)` 
                   : medStart 
                     ? `${medStart} 부터 투약 시작`
                     : medDays > 0
                       ? `${medDays}일간 투약 진행`
                       : '복약 진행 내역'}
               </span>
            </div>
          </div>
          <span className={`w-full md:w-auto px-5 py-3 rounded-xl text-[12px] font-black tracking-widest uppercase text-center
            ${medStatus === 'ACTIVE' ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20' : 'bg-green-600 text-white shadow-lg shadow-green-500/20'}
          `}>
            {medStatus === 'ACTIVE' ? '복약 진행중' : '복약 완료'}
          </span>
        </div>
      )}

    </div>
  );
};
