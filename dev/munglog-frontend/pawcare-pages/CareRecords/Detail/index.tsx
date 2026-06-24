import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { useCareRecordDetail } from './hooks/useCareRecordDetail';
import { CareRecordDetailHeader } from './components/CareRecordDetailHeader';
import { CareRecordInfoSections } from './components/CareRecordInfoSections';
import { CareRecordAttachmentGallery } from './components/CareRecordAttachmentGallery';
import { careApi } from '@/api/careApi';

const CareRecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      navigate('/care-records');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('기록 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm w-full p-12 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <span className="text-5xl mb-6 block grayscale opacity-20">📄</span>
          <h2 className="text-[22px] font-black text-[#2D2D2D] mb-3 tracking-tight">기록을 찾을 수 없습니다.</h2>
          <p className="text-stone-500 font-medium mb-10 leading-relaxed text-sm px-4 break-keep">
            삭제된 기록이거나 <br /> 잘못된 접근입니다.
          </p>
          <button
            onClick={() => navigate('/care-records')}
            className="w-full h-[56px] bg-[#FF6B00] text-white rounded-[16px] font-black text-[15px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      <PageLayout title="" maxWidth="max-w-[760px]" noPaddingTop>
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pt-2 pb-16 space-y-8 lg:space-y-10">

          <CareRecordDetailHeader
            record={record}
            onDelete={() => setIsDeleteModalOpen(true)}
          />

          <section>
            <CareRecordInfoSections record={record} />
          </section>

          <section className="bg-white rounded-[28px] lg:rounded-[36px] p-8 lg:p-10 shadow-sm border border-stone-200/60 min-h-[220px]">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-5 mb-8">
              <span className="text-[20px]">📝</span>
              <h3 className="text-[16px] font-black text-[#2D2D2D] tracking-widest uppercase">
                {((record as any).recordType === 'MEDICAL' || record.recordTypeId === 1) ? 'Clinical ' : 'Diary '}<span className="text-[#FF6B00]">Notes.</span>
              </h3>
            </div>

            <div className="flex flex-col gap-10">
              {record.symptomTags && record.symptomTags.length > 0 && (
                <div className="flex flex-wrap gap-2 -mt-4">
                  {record.symptomTags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1.5 rounded-xl bg-[#FF6B00] text-white text-[12px] font-black shadow-lg shadow-orange-500/20 flex items-center gap-1.5 animate-in zoom-in-95 duration-300"
                    >
                      <span className="opacity-70 text-[10px]">#</span>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(() => {
                const raw = record as any;
                const symptoms = raw.symptoms || raw.medicalDetails?.symptoms || raw.medical_details?.symptoms;
                if (!symptoms || symptoms.trim() === '') return null;
                
                return (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-[12px] font-black text-red-500 uppercase tracking-widest">
                      <span className="w-1 h-3 bg-red-100 rounded-full" /> 발현 증상
                    </h4>
                    <div className="text-[15px] md:text-[16px] leading-[1.9] text-[#2D2D2D] font-medium whitespace-pre-wrap pl-3 border-l-2 border-red-50">
                      {symptoms}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const raw = record as any;
                const treatment = raw.treatment || raw.medicalDetails?.treatment || raw.medical_details?.treatment;
                if (!treatment || treatment.trim() === '') return null;
                return (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-[12px] font-black text-blue-500 uppercase tracking-widest">
                      <span className="w-1 h-3 bg-blue-100 rounded-full" /> 처방 및 수의사 소견
                    </h4>
                    <div className="text-[15px] md:text-[16px] leading-[1.9] text-[#2D2D2D] font-medium whitespace-pre-wrap pl-3 border-l-2 border-blue-50">
                      {treatment}
                    </div>
                  </div>
                );
              })()}

              {record.note && record.note.trim() !== '' && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-[12px] font-black text-stone-400 uppercase tracking-widest">
                    <span className="w-1 h-3 bg-stone-200 rounded-full" /> 보호자 메모 (Diary Note)
                  </h4>
                  <div className="text-[15px] md:text-[16px] leading-[1.9] text-stone-600 font-medium whitespace-pre-wrap pl-3 border-l-2 border-stone-100">
                    {record.note}
                  </div>
                </div>
              )}

              {(() => {
                const raw = record as any;
                const symptoms = raw.symptoms || raw.medicalDetails?.symptoms || raw.medical_details?.symptoms;
                const treatment = raw.treatment || raw.medicalDetails?.treatment || raw.medical_details?.treatment;
                if ((!symptoms || symptoms.trim() === '') &&
                  (!treatment || treatment.trim() === '') &&
                  (!record.note || record.note.trim() === '')) {
                  return (
                    <div className="py-2 text-stone-400 italic font-light tracking-tight">
                      작성된 기록 내용이나 메모가 없습니다.
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </section>

          {files && files.length > 0 && (
            <section className="bg-white rounded-[28px] lg:rounded-[36px] p-8 lg:p-10 shadow-sm border border-stone-200/60">
              <CareRecordAttachmentGallery files={files} />
            </section>
          )}

          <div className="pt-10 flex items-center justify-end gap-3 border-t border-stone-100">
            <button 
              onClick={() => navigate('/care-records')}
              className="px-6 h-[52px] rounded-xl border border-stone-200 text-stone-600 font-bold text-[14px] hover:border-stone-400 transition-all active:scale-95"
            >
              목록
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-6 h-[52px] rounded-xl border border-stone-200 text-stone-400 font-bold text-[14px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
            >
              삭제
            </button>
            <button 
              onClick={() => navigate(`/care-records/edit/${record.id}`)}
              className="px-10 h-[52px] bg-[#FF6B00] text-white rounded-xl font-black text-[14px] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              기록 수정하기
            </button>
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
