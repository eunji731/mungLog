import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { useCareRecordDetail } from '../hooks/useCareRecordDetail';
import { CareRecordDetailHeader } from '../components/CareRecordDetailHeader';
import { CareRecordInfoSections } from '../components/CareRecordInfoSections';
import { CareRecordAttachmentGallery } from '../components/CareRecordAttachmentGallery';
import { careApi } from '@/api/careApi';
import { isMedicalRecordType } from '@/lib/codeGroups';
import { FileText, Edit3, Trash2, ArrowLeft } from 'lucide-react';

interface CareRecordDetailPageProps {
  id?: string;
}

const CareRecordDetailPage: React.FC<CareRecordDetailPageProps> = ({ id }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { record, files, isLoading, error } = useCareRecordDetail(id);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await careApi.deleteRecord(id);
      setIsDeleteModalOpen(false);
      showToast('기록이 삭제되었습니다.', 'success');
      router.push('/care-records');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('기록 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm w-full p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-border shadow-sm">
          <span className="text-5xl mb-6 block grayscale opacity-20">📄</span>
          <h2 className="text-[22px] font-black text-text-main mb-3 tracking-tight">기록을 찾을 수 없습니다.</h2>
          <p className="text-text-sub font-medium mb-10 leading-relaxed text-sm px-4 break-keep">
            삭제된 기록이거나 <br /> 잘못된 접근입니다.
          </p>
          <button
            onClick={() => router.push('/care-records')}
            className="w-full h-[56px] bg-main-green text-white rounded-[16px] font-black text-[15px] shadow-lg shadow-main-green/20 active:scale-95 transition-all hover:bg-main-green/90"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
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

                <div className="flex items-center gap-2.5">
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
