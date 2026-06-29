import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { parseISO, addDays, isBefore, startOfDay, format } from 'date-fns';
import type { CareRecord } from '@/types/care';
import { Card } from '@/components/common/Card';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { usePet } from '@/app/common/hooks/usePet';
import { getImagePath } from '@/lib/clientApi';
import { careApi } from '@/api/careApi';
import { downloadFile } from '@/utils/fileUtils';
import { X, AlertCircle } from 'lucide-react';


export const TimelineItem: React.FC<{ record: CareRecord }> = ({ record }) => {
  const router = useRouter();
  const { pets } = usePet();

  const [linkedSnap, setLinkedSnap] = useState<any>(null);
  const [medInfo, setMedInfo] = useState<{ medStart: string | null; medDays: number; medStatus: string } | null>(null);
  const [loadingMed, setLoadingMed] = useState(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);


  const recordTypeCode = String(record.recordType || '');
  const isMedical = isMedicalRecordType(recordTypeCode);

  const loadLinkedSnap = () => {
    try {
      const data = localStorage.getItem('munglog_symptom_snaps');
      if (data) {
        const snaps = JSON.parse(data);
        const found = snaps.find((s: any) => s.resolvedRecordId === String(record.id));
        setLinkedSnap(found || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLinkedSnap();
    window.addEventListener('symptom_snaps_updated', loadLinkedSnap);
    return () => window.removeEventListener('symptom_snaps_updated', loadLinkedSnap);
  }, [record.id]);

  // 리스트의 복약 뱃지 오표시 방지를 위한 상세정보 추가 페치
  useEffect(() => {
    if (!isMedical) return;
    const fetchMedDetail = async () => {
      try {
        setLoadingMed(true);
        const detail = await careApi.getRecordDetail(record.id);
        if (detail) {
          const rawDetail = detail as any;
          const start = detail.medicationStartDate || rawDetail.medicalDetails?.medicationStartDate;
          const days = Number(detail.medicationDays || rawDetail.medicalDetails?.medicationDays || 0);
          const status = detail.medicationStatus || 'NONE';
          setMedInfo({
            medStart: start ?? null,
            medDays: days,
            medStatus: status
          });
        }
      } catch (err) {
        console.error('Failed to fetch med detail in TimelineItem:', err);
      } finally {
        setLoadingMed(false);
      }
    };
    fetchMedDetail();
  }, [record.id, isMedical]);

  const { codes: recordTypes } = useCommonCodes('RECORD_TYPE');
  const { getCodeNameById } = useCommonCodes('EXPENSE_CATEGORY');

  const rawRecord = record as any;

  const handleCardClick = () => {
    router.push(`/care-records/${record.id}`);
  };

  const getField = (camelField: string, snakeField: string) =>
    rawRecord[camelField] ??
    rawRecord[snakeField] ??
    rawRecord.medicalDetails?.[camelField] ??
    rawRecord.medical_details?.[snakeField] ??
    rawRecord.medicalDetails?.[snakeField] ??
    rawRecord.medical_details?.[camelField];

  const medDays = medInfo ? medInfo.medDays : Number(getField('medicationDays', 'medication_days') || 0);
  const medStart = medInfo ? medInfo.medStart : getField('medicationStartDate', 'medication_start_date');
  const isMedCompletedRaw = getField('isMedicationCompleted', 'is_medication_completed');

  let medStatus = medInfo ? medInfo.medStatus : (record.medicationStatus || (isMedCompletedRaw === true ? 'COMPLETED' : (isMedCompletedRaw === false ? 'ACTIVE' : undefined)));
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
  } else if (!medStatus && medDays > 0) {
    medStatus = 'ACTIVE';
  }

  const hasMedication = !loadingMed && !!((medStart || medDays > 0) && medStatus && medStatus !== 'NONE');

  // 카테고리 표시 이름 결정 (ID 기반 조회 사용)
  const categoryId = record.categoryTypeId || rawRecord.category_type_id || rawRecord.categoryId || rawRecord.category_id;
  const categoryName = categoryId ? getCodeNameById(Number(categoryId)) : (record.categoryCode || '지출');

  // usePetStore에서 일치하는 반려견의 프로필 이미지(photo)를 조회
  const matchedDog = pets.find(p => String(p.id) === String(record.dogId || record.petId));
  const dogProfileUrl = matchedDog?.photo || record.dogProfileImageUrl;

  return (
    <div className="group flex gap-4 md:gap-8 lg:gap-10 items-stretch relative">

      <div className="flex flex-col items-center flex-shrink-0 pt-6 relative z-10 w-4 md:w-6">
        <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-[3px] border-background shadow-md transition-all duration-500 group-hover:scale-125
          ${isMedical ? 'bg-main-green' : 'bg-main-yellow'}`}
        />
        <div className="w-px h-full min-h-[60px] bg-border mt-4 group-last:hidden opacity-60" />
      </div>

      <Card
        onClick={handleCardClick}
        className="flex-grow p-5 md:p-6 lg:p-7 mb-6 group-last:mb-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-main-green/5 border-border cursor-pointer overflow-hidden relative"
      >
        <div className="flex justify-between items-start md:items-center mb-3">
          <div className="flex items-center gap-3">
            <span className={`text-[9px] md:text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase border
              ${isMedical ? 'bg-main-green text-white border-main-green' : 'bg-surface-green text-text-sub border-border'}`}>
              {recordTypes.find(t => t.code === recordTypeCode)?.codeName || recordTypeCode || '기록'}
            </span>
            <span className="text-[13px] md:text-[14px] font-bold text-text-sub tabular-nums tracking-tight">
              {record.recordDate}
            </span>
          </div>

          {record.amount !== undefined && record.amount !== null && (
            <div className="text-right hidden sm:block">
              <span className="text-[18px] md:text-[22px] font-black text-foreground tabular-nums tracking-tighter">
                {record.amount.toLocaleString()}
                <span className="text-[13px] ml-0.5 text-text-sub font-bold tracking-normal">원</span>
              </span>
            </div>
          )}
        </div>

        <h4 className="text-[18px] md:text-[22px] font-black text-foreground tracking-tight leading-snug mb-5 pr-2 md:pr-0">
          {record.title}
        </h4>

        {linkedSnap && (
          <div className="mb-5 p-3.5 bg-amber-500/5 border border-amber-100 rounded-2xl flex gap-3 items-start animate-in fade-in duration-300">
            {linkedSnap.photoUrl && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsViewingPhoto(true);
                }}
                className="w-12 h-12 rounded-lg overflow-hidden border border-amber-200/50 shrink-0 bg-stone-100 relative cursor-pointer hover:opacity-85 hover:border-amber-400 transition-all"
                title="사진 클릭하여 확인/다운로드"
              >
                <img src={linkedSnap.photoUrl} alt="Symptom" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                  연동된 증상: {(linkedSnap.symptomTags || [linkedSnap.symptomTag || '기타']).join(', ')}
                </span>
                <span className="text-[9px] font-bold text-text-sub">
                  {linkedSnap.date} {linkedSnap.time} 관찰됨
                </span>
              </div>
              <p className="text-[11px] font-bold text-text-main line-clamp-2 leading-relaxed">
                {linkedSnap.memo}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-green border border-border shrink-0 flex items-center justify-center">
                {dogProfileUrl ? (
                  <img src={getImagePath(dogProfileUrl, 'profiles')} alt={record.dogName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[8px] grayscale opacity-40">🐕</span>
                )}
              </div>
              <span className="text-[13px] font-bold text-foreground tracking-tight">
                {record.dogName}
              </span>
            </div>

            <div className="hidden sm:block w-px h-3 bg-border" />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold text-foreground bg-surface-green border border-border px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                {isMedical ? '🏥' : '🏷️'} {isMedical ? (record.clinicName || recordTypes.find(t => t.code === recordTypeCode)?.codeName || '진료') : categoryName}
              </span>

              {isMedical && hasMedication && (
                <span className={`text-[11px] font-black border px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm
                  ${medStatus === 'ACTIVE'
                    ? 'text-main-green bg-main-green/5 border-main-green/20'
                    : 'text-emerald-600 bg-emerald-500/5 border-emerald-500/20'}`}>
                  <span className="text-[12px]">💊</span>
                  {medStatus === 'ACTIVE' ? '복약중' : '복약완료'}
                  {medEndDateStr && <span className="opacity-60 font-bold ml-0.5">~{medEndDateStr}</span>}
                </span>
              )}

              {record.relatedMedicalRecordId && (
                <span className="text-[11px] font-black text-main-green bg-main-green/5 border-main-green/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span className="text-[12px] opacity-80">🔗</span> 진료 연동
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 gap-4">
            {record.amount !== undefined && record.amount !== null && (
              <div className="sm:hidden flex items-baseline gap-1">
                <span className="text-[18px] font-black text-[#2D2D2D] tabular-nums tracking-tighter">
                  {record.amount.toLocaleString()}
                </span>
                <span className="text-[12px] text-stone-400 font-bold">원</span>
              </div>
            )}

            {record.attachmentCount > 0 && (
              <div className="flex items-center gap-1.5 text-stone-400 ml-auto sm:ml-0 bg-stone-50 px-2 py-1 rounded-lg border border-stone-100">
                <span className="text-[12px]">📎</span>
                <span className="text-[11px] font-black tabular-nums tracking-wider">{record.attachmentCount}</span>
              </div>
            )}
          </div>

        </div>
      </Card>

      {isViewingPhoto && linkedSnap && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setIsViewingPhoto(false);
          }}
        >
          <div
            className="bg-background w-full max-w-lg rounded-[32px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-amber-500/10 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h4 className="font-black text-sm text-text-main">연동된 증상 사진 확인</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsViewingPhoto(false)}
                className="p-1 hover:bg-border rounded-lg text-text-sub transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 no-scrollbar pb-10">
              {/* Photo */}
              <div
                onClick={() => setFullscreenPhoto(linkedSnap.photoUrl)}
                className="relative rounded-2xl overflow-hidden border border-border bg-stone-950/5 flex items-center justify-center max-h-[320px] min-h-[180px] w-full cursor-zoom-in hover:opacity-90 transition-opacity"
                title="사진 클릭하여 확대"
              >
                <img
                  src={linkedSnap.photoUrl}
                  alt="Symptom"
                  className="max-h-[320px] max-w-full w-auto h-auto object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    const fileName = `linked_symptom_${record.recordDate}.png`;
                    downloadFile(linkedSnap.photoUrl, fileName);
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/85 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  ⬇ 다운로드
                </button>
              </div>


              {/* Info */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-text-sub uppercase tracking-wider">증상 메모</span>
                <p className="text-xs font-bold text-text-main leading-relaxed bg-stone-50/50 p-4 border border-border rounded-2xl">
                  {linkedSnap.memo || '이상 증상이 관찰됨.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsViewingPhoto(false)}
                  className="w-full py-3 bg-main-green hover:bg-main-green/90 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen Photo Modal */}
      {fullscreenPhoto && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setFullscreenPhoto(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              className="absolute -top-16 right-0 text-white/40 hover:text-white transition-colors text-3xl cursor-pointer"
              onClick={() => setFullscreenPhoto(null)}
            >
              ✕
            </button>

            <img
              src={fullscreenPhoto}
              alt="Enlarged view"
              className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
            />

            <div className="mt-8">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(fullscreenPhoto, 'linked_symptom_enlarged.png');
                }}
                className="text-[11px] font-black text-main-green bg-white dark:bg-zinc-800 px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-light-green transition-colors cursor-pointer"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

