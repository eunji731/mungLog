import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Section } from '@/components/common/Section';
import { MedicalForm } from '../components/MedicalForm';
import { ExpenseForm } from '../components/ExpenseForm';
import { CommonInfoForm } from '../components/CommonInfoForm';
import { FileUploader } from '@/components/common/FileUploader';
import { useCareRecordForm } from '../hooks/useCareRecordForm';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { symptomSnapApi } from '@/api/symptomSnapApi';
import type { SymptomSnap } from '../components/SymptomSnapboard';

interface CareRecordFormPageProps {
  id?: string;
  prefillDate?: string;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
  isEmbedded?: boolean;
}

const CareRecordFormPage: React.FC<CareRecordFormPageProps> = ({
  id: propId,
  prefillDate,
  onSaveSuccess,
  onCancel,
  isEmbedded = false
}) => {
  const id = propId;
  const router = useRouter();
  const isEdit = !!id;

  const {
    recordTypeId, setRecordTypeId,
    commonData, setCommonData,
    medicalData, setMedicalData,
    expenseData, setExpenseData,
    fileUploader,
    handleSave,
    isLoading,
    isFetching,
    pendingSnapId, setPendingSnapId
  } = useCareRecordForm(id, { prefillDate, onSaveSuccess });

  const { codes: allRecordTypes } = useCommonCodes('RECORD_TYPE');
  const recordTypes = allRecordTypes.filter(t => t.code !== 'MEMO');

  const isMedicalSelected = React.useMemo(() => {
    const activeType = recordTypes.find(t => t.id === recordTypeId);
    if (!activeType) return true;
    return isMedicalRecordType(activeType.code);
  }, [recordTypeId, recordTypes]);

  // 증상 스냅 연동 상태
  const [linkedSnap, setLinkedSnap] = useState<SymptomSnap | null>(null);
  const [availableSnaps, setAvailableSnaps] = useState<SymptomSnap[]>([]);
  const [showSnapLink, setShowSnapLink] = useState(false);

  const loadSnaps = useCallback(async (petId?: string, recordId?: string) => {
    try {
      const snaps = await symptomSnapApi.getSnaps(petId ? { petId } : {});
      if (recordId) {
        const linked = snaps.find(s => s.resolvedRecordId === recordId);
        setLinkedSnap(linked || null);
      } else {
        setLinkedSnap(null);
      }
      // 케어기록 연동 기준으로 필터 (일정 연동 여부와 무관)
      const available = snaps.filter(s => {
        if (recordId) return !s.resolvedRecordId || s.resolvedRecordId === recordId;
        return !s.resolvedRecordId;
      });
      setAvailableSnaps(available);
    } catch (e) {
      console.error('Failed to load snaps in care record form:', e);
    }
  }, []);

  useEffect(() => {
    loadSnaps(commonData.dogId || undefined, id);
  }, [commonData.dogId, id, loadSnaps]);

  const handleLinkSnap = async (snap: SymptomSnap) => {
    if (isEdit && id) {
      try {
        await symptomSnapApi.linkRecord(snap.id, id);
        await loadSnaps(commonData.dogId || undefined, id);
      } catch (e) {
        console.error('Failed to link snap:', e);
      }
    } else {
      // 신규 등록 모드: 선택만 해두고 저장 시 훅에서 처리
      setPendingSnapId(snap.id);
      setLinkedSnap(snap);
      setAvailableSnaps(prev => prev.filter(s => s.id !== snap.id));
    }
    setShowSnapLink(false);
  };

  const handleUnlinkSnap = async () => {
    if (!linkedSnap) return;
    if (isEdit && id) {
      try {
        await symptomSnapApi.unlinkRecord(linkedSnap.id);
        await loadSnaps(commonData.dogId || undefined, id);
      } catch (e) {
        console.error('Failed to unlink snap:', e);
      }
    } else {
      // 신규 등록 모드: 선택 취소
      setPendingSnapId('');
      setAvailableSnaps(prev => [...prev, linkedSnap]);
      setLinkedSnap(null);
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className={`bg-background border-b border-border shrink-0 ${isEmbedded ? 'px-4 py-3 lg:px-5 lg:py-3.5' : 'p-6 lg:px-10 lg:py-6'}`}>
        <div className={`max-w-4xl mx-auto flex justify-between items-center gap-4 ${isEmbedded ? '' : 'flex-col md:flex-row md:items-center'}`}>
          <div>
            {!isEmbedded && <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Care Records Form</span>}
            <h1 className={`${isEmbedded ? 'text-base lg:text-lg' : 'text-2xl lg:text-3xl'} font-black text-foreground tracking-tight`}>
              {isEdit ? '케어기록 수정' : '새 케어기록 등록'}
            </h1>
            {!isEmbedded && <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">반려견의 건강 정보를 기록하세요.</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={onCancel || (() => router.back())} className="px-4 font-bold text-text-sub text-xs">취소</Button>
            <Button onClick={handleSave} disabled={isLoading} className="px-6 h-[40px] text-xs font-black rounded-xl">
              {isLoading ? '저장 중...' : (isEdit ? '수정' : '저장')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className={`flex-1 overflow-y-auto no-scrollbar bg-surface-green/10 ${isEmbedded ? 'p-4 pt-1.5 space-y-3' : 'p-6 lg:p-8 space-y-6'}`}>
        <div className={`max-w-4xl mx-auto ${isEmbedded ? 'space-y-3' : 'space-y-6'}`}>

          {/* 기록 종류 선택 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-2 w-full">
            {recordTypes.map((type) => {
              const isActive = recordTypeId === type.id;

              const getEmoji = (code: string) => {
                switch (code) {
                  case 'HOSPITAL': return '🏥';
                  case 'MEDICINE': return '💊';
                  case 'GROOMING': return '✂️';
                  case 'VACCINATION': return '💉';
                  case 'CHECKUP': return '🩺';
                  case 'EXPENSE': return '💳';
                  default: return '📝';
                }
              };

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRecordTypeId(type.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-[11px] font-black transition-all duration-300 active:scale-[0.98] whitespace-nowrap ${
                    isActive
                      ? 'bg-main-green border-main-green text-white shadow-sm shadow-main-green/10'
                      : 'bg-background border-border text-text-sub hover:border-main-green/30 hover:text-main-green'
                  }`}
                >
                  <span className="text-[13px]">{getEmoji(type.code)}</span>
                  <span>{type.codeName}</span>
                </button>
              );
            })}
          </div>

          {/* 공통 정보 */}
          <CommonInfoForm data={commonData} onChange={setCommonData} isEmbedded={isEmbedded} />

          {/* 조건부 상세 폼 (평면 구조 유지) */}
          <div className={`border-t border-border ${isEmbedded ? 'pt-3' : 'pt-6'}`}>
            {isMedicalSelected ? (
              <MedicalForm data={medicalData} onChange={setMedicalData} />
            ) : (
              <ExpenseForm
                data={expenseData}
                dogId={commonData.dogId}
                onDogChange={(id) => setCommonData(prev => ({ ...prev, dogId: id }))}
                onChange={setExpenseData}
              />
            )}
          </div>

          {/* 증상 스냅 연동 */}
          <Section title="증상 스냅 연동" description="이 케어기록과 관련된 이상 증상 관찰 기록을 연동하세요.">
            {linkedSnap ? (
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> 연동된 증상 스냅
                  </span>
                  <button type="button" onClick={handleUnlinkSnap} className="text-[10px] font-black text-text-sub hover:text-red-500 transition-colors">
                    연동 해제
                  </button>
                </div>
                <div className="flex gap-3 items-start">
                  {linkedSnap.photoUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0 bg-stone-100">
                      <img src={linkedSnap.photoUrl} alt="symptom" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {linkedSnap.symptomTags?.map(tag => (
                        <span key={tag} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">#{tag}</span>
                      ))}
                      <span className="text-[9px] text-text-sub font-bold">{linkedSnap.date} {linkedSnap.time}</span>
                    </div>
                    <p className="text-xs font-bold text-text-main truncate">{linkedSnap.memo || '이상 증상 관찰됨'}</p>
                  </div>
                </div>
                {linkedSnap.linkedScheduleId && (
                  <div className="pt-2 border-t border-amber-500/10">
                    <Link
                      href={`/schedules/${linkedSnap.linkedScheduleId}`}
                      className="text-[10px] font-black text-main-green hover:underline flex items-center gap-1"
                    >
                      📅 연동된 예약 일정: {linkedSnap.linkedScheduleTitle || '일정 보기'}
                    </Link>
                  </div>
                )}
              </div>
            ) : availableSnaps.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-text-sub">관찰 중인 증상 스냅이 있습니다.</p>
                  <button type="button" onClick={() => setShowSnapLink(v => !v)} className="text-[11px] font-black text-main-green hover:underline">
                    {showSnapLink ? '접기' : `${availableSnaps.length}개 · 연동하기`}
                  </button>
                </div>
                {showSnapLink && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
                    {availableSnaps.map(snap => (
                      <button
                        key={snap.id}
                        type="button"
                        onClick={() => handleLinkSnap(snap)}
                        className="p-3 border border-border rounded-xl text-left hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all flex gap-3 items-start"
                      >
                        {snap.photoUrl && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-stone-100">
                            <img src={snap.photoUrl} alt="symptom" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-0.5">
                            {snap.symptomTags?.map(tag => (
                              <span key={tag} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">#{tag}</span>
                            ))}
                          </div>
                          <p className="text-[11px] font-bold text-text-main truncate">{snap.memo || '이상 증상 관찰됨'}</p>
                          <p className="text-[9px] text-text-sub mt-0.5">{snap.date} {snap.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-bold text-text-sub py-2">관찰 중인 이상 증상 스냅이 없습니다.</p>
            )}
          </Section>

          {/* 첨부 파일 */}
          <Section title="첨부 파일" description="사진이나 영수증을 첨부하세요.">
            <div className="pt-2">
              <FileUploader
                variant="grid"
                mode="multiple"
                maxCount={10}
                fileInfos={fileUploader.fileInfos}
                onFileSelect={(files) => fileUploader.handleSelect(files, 10)}
                onFileDelete={fileUploader.handleDelete}
                loading={fileUploader.isUploading}
              />
            </div>
          </Section>

          <div className="pt-6 flex justify-center border-t border-border">
            <Button
              size="md"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full max-w-sm h-[48px] text-[14px] font-black rounded-2xl"
            >
              {isLoading ? '저장 중...' : (isEdit ? '수정 완료' : '기록 저장하기')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareRecordFormPage;
