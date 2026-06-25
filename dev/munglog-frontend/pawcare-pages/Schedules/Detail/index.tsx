import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useScheduleDetail } from './hooks/useScheduleDetail';
import { ScheduleDetailHeader } from './components/ScheduleDetailHeader';
import { ScheduleDetailInfo } from './components/ScheduleDetailInfo';
import { CareRecordAttachmentGallery } from '@/pages/CareRecords/Detail/components/CareRecordAttachmentGallery';
import { scheduleApi } from '@/api/scheduleApi';
import { useToast } from '@/context/ToastContext';
import { CheckCircle2, Circle } from 'lucide-react';

interface ScheduleDetailPageProps {
  id?: string;
}

const ScheduleDetailPage: React.FC<ScheduleDetailPageProps> = ({ id }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { schedule, files, isLoading, error, refetch } = useScheduleDetail(id);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await scheduleApi.deleteSchedule(id);
      setIsDeleteModalOpen(false);
      router.push('/schedules');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('일정 삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!schedule) return;
    try {
      await scheduleApi.toggleCompletion(schedule.id);
      refetch();
    } catch (err) {
      console.error('Toggle complete failed:', err);
      showToast('완료 처리에 실패했습니다.', 'error');
    }
  };

  // 백엔드가 직접 케어기록을 생성하고 새 ID를 돌려줍니다. 생성 후 수정 페이지로 이동해 추가 정보를 입력합니다.
  const handleConvertToCareRecord = async () => {
    if (!id) return;
    if (!window.confirm('이 일정을 케어기록으로 전환하시겠습니까? \n전환 후 등록된 기록을 바로 수정할 수 있습니다.')) return;

    try {
      setIsConverting(true);
      const newRecordId = await scheduleApi.convertToCareRecord(id);
      showToast('케어기록으로 전환되었습니다! ✨', 'success');
      router.push(`/care-records/edit/${newRecordId}`);
    } catch (err: any) {
      console.error('Convert to care record failed:', err);
      showToast(err?.response?.data?.message || '케어기록 전환에 실패했습니다.', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm w-full p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-border shadow-sm">
          <span className="text-5xl mb-6 block grayscale opacity-20">🗓️</span>
          <h2 className="text-[22px] font-black text-text-main mb-3 tracking-tight">일정을 찾을 수 없습니다.</h2>
          <p className="text-text-sub font-medium mb-10 leading-relaxed text-sm px-4 break-keep">
            삭제된 일정이거나 <br /> 잘못된 접근입니다.
          </p>
          <button
            onClick={() => router.push('/schedules')}
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
          
          <ScheduleDetailHeader schedule={schedule} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left side: Info Cards sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <ScheduleDetailInfo 
                schedule={schedule} 
              />
            </div>

            {/* Right side: Detailed Notes, Gallery and Action Buttons */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-8">
              
              {/* Completion Action Card (완료 버튼 + 재고 연동 표시) */}
              <div className="bg-white dark:bg-zinc-900 rounded-[28px] lg:rounded-[36px] p-6 md:p-8 lg:p-10 shadow-xs border border-border flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Action / Integration</span>
                    <h4 className="text-[15px] font-black text-text-main">일정 완료 처리</h4>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleToggleComplete}
                    className={`h-[48px] px-6 rounded-full font-black text-[13px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer shrink-0 ${
                      schedule.isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-none hover:bg-emerald-500/15'
                        : 'bg-main-green text-white shadow-main-green/10 hover:shadow-main-green/20'
                    }`}
                  >
                    {schedule.isCompleted ? (
                      <><CheckCircle2 className="w-4.5 h-4.5" /> 완료됨 · 취소하기</>
                    ) : (
                      <><Circle className="w-4.5 h-4.5" /> 완료 처리하기</>
                    )}
                  </button>
                </div>

                <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
                  schedule.inventoryItemId
                    ? 'bg-main-green/5 border-main-green/10'
                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-border'
                }`}>
                  <span className="text-lg shrink-0">📦</span>
                  {schedule.inventoryItemId ? (
                    <span className="text-[12px] font-bold text-foreground">
                      <span className="text-main-green font-black">재고 연동됨</span> · {schedule.inventoryItemName} (재고 {schedule.inventoryItemStock ?? 0}개)
                      {schedule.isCompleted ? ' · 완료 처리되어 재고가 차감되었습니다.' : ' · 완료 처리하면 재고가 자동으로 차감됩니다.'}
                    </span>
                  ) : (
                    <span className="text-[12px] font-bold text-text-sub">
                      재고 연동 안 됨 · 완료 처리해도 재고는 줄지 않습니다. (수정에서 연동 가능)
                    </span>
                  )}
                </div>
              </div>

              {/* Note Card */}
              <section className="bg-white dark:bg-zinc-900 rounded-[28px] lg:rounded-[36px] p-6 md:p-8 lg:p-10 shadow-xs border border-border min-h-[220px] space-y-8">
                {/* Section Header */}
                <div className="flex items-center gap-3 border-b border-border pb-5">
                  <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                    <span className="text-[20px]">📝</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Plan Memo / Note</span>
                    <h3 className="text-[16px] font-black text-text-main tracking-widest uppercase mt-0.5">
                      Plan <span className="text-main-green">Memo.</span>
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Symptom Tags */}
                  {schedule.symptomTags && schedule.symptomTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {schedule.symptomTags.map((tag: string) => (
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

                  {/* Memo Content Block */}
                  <div className="bg-surface-green/50 dark:bg-zinc-900/50 border border-border p-5 rounded-2xl space-y-2.5 transition-all duration-300">
                    <h4 className="flex items-center gap-2 text-[11px] font-black text-text-sub uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-text-sub rounded-full" /> 상세 메모 및 참고사항 (Plan Memo)
                    </h4>
                    <div className="text-[14px] md:text-[15px] leading-[1.8] text-text-main/85 font-bold whitespace-pre-wrap pl-0.5">
                      {schedule.memo || '작성된 메모가 없습니다.'}
                    </div>
                  </div>
                </div>
              </section>

              {/* Attachment Gallery Card */}
              {files && files.length > 0 && (
                <section className="bg-white dark:bg-zinc-900 rounded-[28px] lg:rounded-[36px] p-6 md:p-8 lg:p-10 shadow-xs border border-border">
                  <CareRecordAttachmentGallery files={files} />
                </section>
              )}

              {/* Action Bar */}
              <div className="pt-6 flex items-center justify-between gap-3 border-t border-border flex-wrap">
                <button 
                  onClick={() => router.push('/schedules')}
                  className="px-6 h-[48px] rounded-full border border-border text-text-sub font-black text-[13px] hover:border-text-sub hover:text-text-main hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  목록으로
                </button>
                
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-5 h-[48px] rounded-full border border-border text-text-sub hover:text-red-500 hover:border-red-200/50 hover:bg-red-500/5 transition-all font-black text-[13px] active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    삭제
                  </button>
                  <button 
                    onClick={() => router.push(`/schedules/edit/${schedule.id}`)}
                    className="px-8 h-[48px] bg-background border-2 border-main-green text-main-green rounded-full font-black text-[13px] hover:bg-main-green/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    수정하기
                  </button>
                  {schedule.convertedCareRecordId ? (
                    <button
                      onClick={() => router.push(`/care-records/${schedule.convertedCareRecordId}`)}
                      className="px-8 h-[48px] bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/20 rounded-full font-black text-[13px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      ✅ 전환된 케어기록 보기
                    </button>
                  ) : (
                    <button
                      onClick={handleConvertToCareRecord}
                      disabled={isConverting}
                      className="px-8 h-[48px] bg-main-green text-white rounded-full font-black text-[13px] shadow-md shadow-main-green/10 hover:shadow-lg hover:shadow-main-green/20 hover:bg-main-green/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {isConverting ? '전환 중...' : '✅ 케어기록으로 전환'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </PageLayout>

      {/* Delete Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        title="일정 삭제"
        description={
          schedule.convertedCareRecordId
            ? '이미 케어기록으로 전환된 일정입니다. 삭제해도 전환된 케어기록은 그대로 남아있어요. 이 예약을 목록에서 영구히 삭제하시겠습니까?'
            : '이 예약을 목록에서 영구히 삭제하시겠습니까?'
        }
        confirmText="삭제합니다"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ScheduleDetailPage;
