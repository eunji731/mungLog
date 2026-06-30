import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useToast } from '@/app/common/hooks/useToast';
import { useCareRecordDetail } from '../hooks/useCareRecordDetail';
import { CareRecordDetailHeader } from '../components/CareRecordDetailHeader';
import { CareRecordInfoSections } from '../components/CareRecordInfoSections';
import { CareRecordAttachmentGallery } from '../components/CareRecordAttachmentGallery';
import { careApi } from '@/api/careApi';
import { symptomSnapApi } from '@/api/symptomSnapApi';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { FileText, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { downloadFile } from '@/utils/fileUtils';
import type { SymptomSnap } from '../components/SymptomSnapboard';

interface CareRecordDetailPageProps {
  id?: string;
}

const CareRecordDetailPage: React.FC<CareRecordDetailPageProps> = ({ id }) => {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { record, files, isLoading, error } = useCareRecordDetail(id);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkedSnap, setLinkedSnap] = useState<SymptomSnap | null>(null);
  const [availableSnaps, setAvailableSnaps] = useState<SymptomSnap[]>([]);
  const [showSnapLink, setShowSnapLink] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const loadSnaps = async (petId?: string, recordId?: string) => {
    try {
      const snaps = await symptomSnapApi.getSnaps(petId ? { petId } : {});
      const linked = snaps.find(s => s.resolvedRecordId === recordId);
      setLinkedSnap(linked || null);
      // 케어기록 연동 기준으로 필터 (일정 연동 여부와 무관)
      const available = snaps.filter(s =>
        !s.resolvedRecordId || s.resolvedRecordId === recordId
      );
      setAvailableSnaps(available);
    } catch (e) {
      console.error('Failed to load snaps in care record detail:', e);
    }
  };

  useEffect(() => {
    if (!id || !record) return;
    const petId = (record.dogId || record.petId)?.toString();
    loadSnaps(petId, id);
  }, [id, record]);

  const handleLinkSnap = async (snap: SymptomSnap) => {
    if (!id || !record) return;
    try {
      await symptomSnapApi.linkRecord(snap.id, id);
      const petId = (record.dogId || record.petId)?.toString();
      await loadSnaps(petId, id);
      setShowSnapLink(false);
    } catch (e) {
      console.error('Failed to link snap to care record:', e);
    }
  };

  const handleUnlinkSnap = async () => {
    if (!id || !linkedSnap) return;
    try {
      await symptomSnapApi.unlinkRecord(linkedSnap.id);
      const petId = (record?.dogId || record?.petId)?.toString();
      await loadSnaps(petId, id);
    } catch (e) {
      console.error('Failed to unlink snap from care record:', e);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await careApi.deleteRecord(id);
      // 백엔드에서 cascade로 snap 연동 해제 처리
      setIsDeleteModalOpen(false);
      success('기록이 삭제되었습니다.');
      router.push('/care-records');
    } catch (err) {
      console.error('Delete failed:', err);
      toastError('기록 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !record) {
    return (
      <EmptyState
        variant="page"
        icon="📄"
        title="기록을 찾을 수 없습니다."
        description={<>삭제된 기록이거나 <br /> 잘못된 접근입니다.</>}
        action={{ label: '목록으로 돌아가기', onClick: () => router.push('/care-records') }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageLayout title="" maxWidth="max-w-6xl" noPaddingTop>
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pt-2 pb-16 space-y-6 lg:space-y-8">

          <CareRecordDetailHeader
            record={record}
            onDelete={() => setIsDeleteModalOpen(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left side: Info Cards sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <CareRecordInfoSections record={record} />
            </div>

            {/* Right side: Detailed Notes, Gallery and Action Buttons */}
            <div className="lg:col-span-8 space-y-6 lg:space-y-8">
              <section className="bg-white dark:bg-zinc-900 rounded-[28px] lg:rounded-[36px] p-6 md:p-8 lg:p-10 shadow-xs border border-border min-h-[220px] space-y-8">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-border pb-5 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-main-green" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Medical / Care Journal</span>
                      <h3 className="text-[16px] font-black text-text-main tracking-widest uppercase mt-0.5">
                        {isMedicalRecordType(record.recordType) ? 'Clinical ' : 'Diary '}<span className="text-main-green">Notes.</span>
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const raw = record as any;
                      const symptoms = raw.symptoms || raw.medicalDetails?.symptoms || raw.medical_details?.symptoms || '';
                      const treatment = raw.treatment || raw.medicalDetails?.treatment || raw.medical_details?.treatment || '';

                      let docContent = `[멍로그 케어 기록]\n`;
                      docContent += `제목: ${record.title}\n`;
                      docContent += `날짜: ${record.recordDate}\n`;
                      docContent += `반려견: ${record.dogName || '아이'}\n`;
                      docContent += `구분: ${isMedicalRecordType(record.recordType) ? '진료 기록 (Hospital)' : '일반 기록 (Diary)'}\n`;
                      if (record.clinicName) docContent += `방문 병원: ${record.clinicName}\n`;
                      if (record.amount !== undefined && record.amount !== null) docContent += `지출 비용: ${record.amount.toLocaleString()}원\n`;
                      if (record.diagnosis) docContent += `진단명: ${record.diagnosis}\n`;

                      if (symptoms.trim()) {
                        docContent += `\n[발현 증상]\n${symptoms}\n`;
                      }
                      if (treatment.trim()) {
                        docContent += `\n[처방 및 소견]\n${treatment}\n`;
                      }
                      if (record.note && record.note.trim()) {
                        docContent += `\n[보호자 작성 노트]\n${record.note}\n`;
                      }

                      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = `care_record_${record.recordDate}_${record.title.replace(/[\s/\\?%*:|"<>]/g, '_')}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                    }}
                    className="px-4 py-2 border border-main-green/30 hover:border-main-green/60 hover:bg-main-green/5 text-main-green rounded-xl text-[11px] font-black tracking-wide cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                    title="기록내용을 텍스트 파일(.txt)로 다운로드합니다"
                  >
                    📥 기록 다운로드
                  </button>
                </div>


                <div className="flex flex-col gap-6">
                  {/* Linked Symptom Snap */}
                  {linkedSnap ? (
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-5 rounded-2xl space-y-2.5 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-amber-600 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          연동된 이상 증상 관찰 기록 (Symptom Snap)
                        </h4>
                        <button
                          type="button"
                          onClick={handleUnlinkSnap}
                          className="text-[10px] font-black text-text-sub hover:text-red-500 transition-colors"
                        >
                          연동 해제
                        </button>
                      </div>
                      <div className="flex gap-4">
                        {linkedSnap.photoUrl && (
                          <div
                            onClick={() => setFullscreenPhoto(linkedSnap.photoUrl!)}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-stone-100 cursor-zoom-in hover:opacity-85 hover:border-amber-300 transition-all"
                          >
                            <img src={linkedSnap.photoUrl} alt="symptom" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {linkedSnap.symptomTags?.map((tag) => (
                              <span key={tag} className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                                #{tag}
                              </span>
                            ))}
                            <span className="text-[10px] text-text-sub font-bold">
                              {linkedSnap.date} {linkedSnap.time} 발생
                            </span>
                          </div>
                          <p className="text-[13px] font-bold text-text-main leading-relaxed mt-1">
                            {linkedSnap.memo}
                          </p>
                        </div>
                      </div>
                      {linkedSnap.linkedScheduleId && (
                        <div className="pt-1.5 border-t border-amber-500/10">
                          <Link
                            href={`/schedules/${linkedSnap.linkedScheduleId}`}
                            className="text-[10px] font-black text-main-green hover:underline flex items-center gap-1"
                          >
                            📅 원본 예약 일정: {linkedSnap.linkedScheduleTitle || '일정 보기'}
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : availableSnaps.length > 0 && (
                    <div className="border border-dashed border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                          연동할 증상 스냅 (Symptom Snap)
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowSnapLink(v => !v)}
                          className="text-[10px] font-black text-main-green hover:underline"
                        >
                          {showSnapLink ? '접기' : `${availableSnaps.length}개 관찰 중 · 연동하기`}
                        </button>
                      </div>
                      {showSnapLink && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
                          {availableSnaps.map(snap => (
                            <button
                              key={snap.id}
                              type="button"
                              onClick={() => handleLinkSnap(snap)}
                              className="p-3 border border-border rounded-xl text-left hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all flex gap-3 items-start group"
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
                  )}

                  {/* Symptom Tags */}
                  {record.symptomTags && record.symptomTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {record.symptomTags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3.5 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-500 text-[11px] font-black border border-red-200/30 flex items-center gap-1.5 animate-in zoom-in-95 duration-300 shadow-xs"
                        >
                          <span className="opacity-70 text-[9px]">#</span>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Symptoms Content Block */}
                  {(() => {
                    const raw = record as any;
                    const symptoms = raw.symptoms || raw.medicalDetails?.symptoms || raw.medical_details?.symptoms;
                    if (!symptoms || symptoms.trim() === '') return null;

                    return (
                      <div className="bg-red-500/5 dark:bg-red-950/15 border border-red-500/10 p-5 rounded-2xl space-y-2.5 transition-all duration-300">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-red-500 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> 발현 증상 (Symptoms)
                        </h4>
                        <div className="text-[14px] md:text-[15px] leading-[1.8] text-text-main font-bold whitespace-pre-wrap pl-0.5">
                          {symptoms}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Treatment Content Block */}
                  {(() => {
                    const raw = record as any;
                    const treatment = raw.treatment || raw.medicalDetails?.treatment || raw.medical_details?.treatment;
                    if (!treatment || treatment.trim() === '') return null;
                    return (
                      <div className="bg-blue-500/5 dark:bg-blue-950/15 border border-blue-500/10 p-5 rounded-2xl space-y-2.5 transition-all duration-300">
                        <h4 className="flex items-center gap-2 text-[11px] font-black text-blue-500 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> 처방 및 소견 (Treatment)
                        </h4>
                        <div className="text-[14px] md:text-[15px] leading-[1.8] text-text-main font-bold whitespace-pre-wrap pl-0.5">
                          {treatment}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Diary Note Content Block */}
                  {record.note && record.note.trim() !== '' && (
                    <div className="bg-surface-green/50 dark:bg-zinc-900/50 border border-border p-5 rounded-2xl space-y-2.5 transition-all duration-300">
                      <h4 className="flex items-center gap-2 text-[11px] font-black text-text-sub uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-text-sub rounded-full" /> 보호자 작성 노트 (Diary Note)
                      </h4>
                      <div className="text-[14px] md:text-[15px] leading-[1.8] text-text-main/80 font-bold whitespace-pre-wrap pl-0.5">
                        {record.note}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {(() => {
                    const raw = record as any;
                    const symptoms = raw.symptoms || raw.medicalDetails?.symptoms || raw.medical_details?.symptoms;
                    const treatment = raw.treatment || raw.medicalDetails?.treatment || raw.medical_details?.treatment;
                    if ((!symptoms || symptoms.trim() === '') &&
                      (!treatment || treatment.trim() === '') &&
                      (!record.note || record.note.trim() === '')) {
                      return (
                        <div className="py-12 text-center text-text-sub italic font-light tracking-tight bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-border">
                          작성된 기록 내용이나 메모가 없습니다.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </section>

              {/* Attachments Section */}
              {files && files.length > 0 && (
                <section className="bg-white dark:bg-zinc-900 rounded-[28px] lg:rounded-[36px] p-6 md:p-8 lg:p-10 shadow-xs border border-border">
                  <CareRecordAttachmentGallery files={files} />
                </section>
              )}

              {/* Action Buttons */}
              <div className="pt-6 flex items-center justify-between gap-3 border-t border-border flex-wrap">
                <button
                  onClick={() => router.push('/care-records')}
                  className="px-6 h-[48px] rounded-full border border-border text-text-sub font-black text-[13px] hover:border-text-sub hover:text-text-main hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> 목록으로
                </button>

                <div className="flex items-center gap-2.5 flex-wrap justify-end">
                  {linkedSnap?.linkedScheduleId && (
                    <button
                      onClick={() => router.push(`/schedules/${linkedSnap.linkedScheduleId}`)}
                      className="px-5 h-[48px] rounded-full border border-main-green/30 text-main-green hover:bg-main-green/5 hover:border-main-green/60 transition-all font-black text-[13px] active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      📅 연동된 일정 보기
                    </button>
                  )}
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-5 h-[48px] rounded-full border border-border text-text-sub hover:text-red-500 hover:border-red-200/50 hover:bg-red-500/5 transition-all font-black text-[13px] active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 삭제
                  </button>
                  <button
                    onClick={() => router.push(`/care-records/edit/${record.id}`)}
                    className="px-8 h-[48px] bg-main-green text-white rounded-full font-black text-[13px] shadow-md shadow-main-green/10 hover:shadow-lg hover:shadow-main-green/20 hover:bg-main-green/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> 기록 수정하기
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </PageLayout>

      {fullscreenPhoto && mounted && createPortal(
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
                  downloadFile(fullscreenPhoto, 'symptom_snap_enlarged.png');
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

      <ConfirmModal
        open={isDeleteModalOpen}
        title="기록 영구 삭제"
        description="이 동물 차트 기록 공간을 완전히 지우시겠습니까? 포함된 사진과 처방 데이터 모두 복구할 수 없습니다."
        confirmText="영구 삭제합니다"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default CareRecordDetailPage;
