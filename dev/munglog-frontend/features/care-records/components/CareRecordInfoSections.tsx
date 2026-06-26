import React from 'react';
import { useRouter } from 'next/navigation';
import { parseISO, addDays, isBefore, startOfDay, format } from 'date-fns';
import type { CareRecord } from '@/types/care';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { CreditCard, MapPin, Activity, Pill, ArrowRight } from 'lucide-react';

interface CareRecordInfoSectionsProps {
  record: CareRecord;
}

export const CareRecordInfoSections: React.FC<CareRecordInfoSectionsProps> = ({ record }) => {
  const router = useRouter();

  const recordTypeCode = String(record.recordType || '');
  const isMedical = isMedicalRecordType(recordTypeCode);

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
    <div className="flex flex-col gap-5">

      <div className={`flex flex-col md:grid lg:flex lg:flex-col gap-4 ${isMedical ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>

        {record.amount !== undefined && record.amount !== null && (
          <div className="bg-gradient-to-br from-main-green to-deep-green text-white rounded-3xl p-6 shadow-lg shadow-main-green/20 relative overflow-hidden flex flex-col justify-between min-h-[135px] group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <span className="text-white/80 text-[10px] font-black uppercase tracking-widest opacity-90">Total Amount</span>
              <CreditCard className="w-5 h-5 text-white/85" />
            </div>
            <div className="mt-4 flex items-end">
              <span className="text-white text-3xl font-black tracking-tight tabular-nums leading-none">
                {record.amount.toLocaleString()}
              </span>
              <span className="text-white/80 text-[12px] font-bold ml-1.5 mb-0.5">원</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-border flex flex-col justify-between min-h-[135px] hover:shadow-md hover:border-main-green/20 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-text-sub text-[10px] font-black uppercase tracking-widest">
               {isMedical ? '방문 병원' : '지출 카테고리'}
            </span>
            {isMedical ? <MapPin className="w-5 h-5 text-main-green" /> : <Activity className="w-5 h-5 text-main-green" />}
          </div>
          <div className="mt-4 text-text-main text-lg font-black tracking-tight leading-snug break-keep">
            {isMedical ? (record.clinicName || '-') : categoryDisplayName}
          </div>
        </div>

        {isMedical && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-border flex flex-col justify-between min-h-[135px] hover:shadow-md hover:border-main-green/20 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-text-sub text-[10px] font-black uppercase tracking-widest">진단 / 치료명</span>
              <Activity className="w-5 h-5 text-main-green" />
            </div>
            <div className="mt-4 text-text-main text-lg font-black tracking-tight leading-snug break-keep">
              {record.diagnosis || '-'}
            </div>
          </div>
        )}
      </div>

      {relatedMedical && (
        <div
          onClick={() => router.push(`/care-records/${relatedMedical.id}`)}
          className="group bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xs border border-border cursor-pointer hover:border-main-green/30 hover:shadow-md hover:shadow-main-green/5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-text-sub text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-main-green rounded-full animate-pulse" /> 연관된 진료 정보
              </span>
              <h4 className="text-[15px] font-black text-text-main group-hover:text-main-green transition-colors">
                [{relatedMedical.recordDate}] {relatedMedical.title || relatedMedical.clinicName || '진료 기록'}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-4">
              <span className="text-[10px] font-black text-text-sub uppercase tracking-wider group-hover:text-main-green transition-colors">상세보기</span>
              <ArrowRight className="w-4 h-4 text-text-sub group-hover:text-main-green group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      )}

      {isMedical && medStatus && medStatus !== 'NONE' && (medStart || medDays > 0) && (
        <div className={`rounded-3xl p-6 flex flex-col gap-4 border shadow-xs transition-all duration-300
          ${medStatus === 'ACTIVE'
            ? 'bg-main-green/5 dark:bg-zinc-900/50 border-main-green/20'
            : 'bg-zinc-50 dark:bg-zinc-900 border-border'}
        `}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Medication Status</span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase
              ${medStatus === 'ACTIVE' ? 'bg-main-green/10 text-main-green' : 'bg-text-sub/10 text-text-sub'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${medStatus === 'ACTIVE' ? 'bg-main-green animate-pulse' : 'bg-text-sub'}`} />
              {medStatus === 'ACTIVE' ? '복약 진행중' : '복약 완료'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-xs shrink-0 border
              ${medStatus === 'ACTIVE' ? 'bg-white dark:bg-zinc-800 text-main-green border-main-green/10' : 'bg-background dark:bg-zinc-900 text-text-sub border-border'}`}>
              💊
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-text-main leading-tight">
                {medStart && medDays > 0 && medEndDateStr
                  ? `${medStart} ~ ${medEndDateStr}`
                  : medStart
                    ? `${medStart} 부터`
                    : '진행 내역 없음'}
              </span>
              <span className="text-[11px] font-medium text-text-sub mt-0.5">
                {medDays > 0 ? `${medDays}일간 투약 진행` : '투약 일수 미정'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
