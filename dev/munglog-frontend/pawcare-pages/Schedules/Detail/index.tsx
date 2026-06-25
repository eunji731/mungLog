import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useScheduleDetail } from './hooks/useScheduleDetail';
import { ScheduleDetailHeader } from './components/ScheduleDetailHeader';
import { ScheduleDetailInfo } from './components/ScheduleDetailInfo';
import { CareRecordAttachmentGallery } from '@/pages/CareRecords/Detail/components/CareRecordAttachmentGallery';
import { scheduleApi } from '@/api/scheduleApi';
import { useToast } from '@/context/ToastContext';

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
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center p-6">
        <div className="text-center max-w-sm w-full p-12 bg-background rounded-3xl border border-border shadow-sm">
          <span className="text-5xl mb-6 block grayscale opacity-20">🗓️</span>
          <h2 className="text-[22px] font-black text-foreground mb-3 tracking-tight">일정을 찾을 수 없습니다.</h2>
          <p className="text-text-sub font-medium mb-10 leading-relaxed text-sm px-4 break-keep">
            삭제된 일정이거나 <br /> 잘못된 접근입니다.
          </p>
          <button
            onClick={() => router.push('/schedules')}
            className="w-full h-[56px] bg-main-green text-white rounded-xl font-black text-[15px] shadow-lg shadow-main-green/20 active:scale-95 transition-all"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Schedule Detail</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">일정 상세 정보</h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">등록된 일정 및 예약의 상세 내용입니다.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header Block */}
          <ScheduleDetailHeader schedule={schedule} />

          {/* Data Widgets */}
          <section>
            <ScheduleDetailInfo 
              schedule={schedule} 
              onToggleComplete={handleToggleComplete}
            />
          </section>

          {/* Note Card */}
          <section className="bg-background rounded-3xl p-8 shadow-sm border border-border min-h-[200px]">
            <div className="flex items-center gap-3 border-b border-border pb-5 mb-6">
              <span className="text-[20px]">📝</span>
              <h3 className="text-[15px] font-black text-foreground tracking-widest uppercase">
                Plan <span className="text-main-green">Memo.</span>
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              {/* Symptom Tags (Placed directly under the main header) */}
              {schedule.symptomTags && schedule.symptomTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {schedule.symptomTags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1.5 rounded-xl bg-main-green text-white text-[12px] font-black shadow-lg shadow-main-green/20 flex items-center gap-1.5 animate-in zoom-in-95 duration-300"
                    >
                      <span className="opacity-70 text-[10px]">#</span>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-[11px] font-black text-text-sub uppercase tracking-widest">
                  <span className="w-1 h-3 bg-border rounded-full" /> 상세 메모 및 참고사항
                </h4>
                <div className="text-[14px] leading-[1.8] text-foreground font-medium whitespace-pre-wrap pl-3 border-l-2 border-border">
                  {schedule.memo || '작성된 메모가 없습니다.'}
                </div>
              </div>
            </div>
          </section>

          {/* Attachment Gallery Card */}
          {files && files.length > 0 && (
            <section className="bg-background rounded-3xl p-8 shadow-sm border border-border">
              <CareRecordAttachmentGallery files={files} />
            </section>
          )}

          {/* Action Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border">
            <button 
              onClick={() => router.push('/schedules')}
              className="w-full sm:w-auto px-6 h-[48px] rounded-xl border border-border text-foreground font-bold text-[13px] hover:bg-surface-green transition-all active:scale-95"
            >
              목록
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full sm:w-auto px-6 h-[48px] rounded-xl border border-border text-text-sub font-bold text-[13px] hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/10 transition-all active:scale-95"
            >
              삭제
            </button>
            <button 
              onClick={() => router.push(`/schedules/edit/${schedule.id}`)}
              className="w-full sm:w-auto px-8 h-[48px] bg-background border-2 border-main-green text-main-green rounded-xl font-black text-[13px] hover:bg-main-green/5 active:scale-[0.98] transition-all"
            >
              수정하기
            </button>
            {schedule.convertedCareRecordId ? (
              <button
                onClick={() => router.push(`/care-records/${schedule.convertedCareRecordId}`)}
                className="w-full sm:w-auto px-8 h-[48px] bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/20 rounded-xl font-black text-[13px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                ✅ 전환된 케어기록 보기
              </button>
            ) : (
              <button
                onClick={handleConvertToCareRecord}
                disabled={isConverting}
                className="w-full sm:w-auto px-8 h-[48px] bg-main-green text-white rounded-xl font-black text-[13px] shadow-lg shadow-main-green/20 hover:shadow-main-green/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isConverting ? '전환 중...' : '✅ 케어기록으로 전환'}
              </button>
            )}
          </div>

        </div>
      </div>

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
