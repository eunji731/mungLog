import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { Input } from '@/components/common/Input';
import { DatePicker } from '@/components/common/DatePicker';
import { FormActions } from '@/components/common/FormActions';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { FileUploader } from '@/components/common/FileUploader';
import { useDogForm } from '@/pages/Dogs/Form/hooks/useDogForm';

const DogFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    isLoading,
    isFetching,
    handleSave,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleConfirmDeleteDog,
    isEdit,
    photoUploader,
  } = useDogForm(id);

  if (isFetching) {
    return (
      <PageLayout title="" maxWidth="max-w-[1440px]">
        <div className="h-[600px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-[6px] border-stone-100 border-t-[#FF6B00] rounded-full animate-spin mb-8" />
          <p className="text-stone-300 font-black tracking-widest uppercase text-sm">Synchronizing</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[1440px]">
        {/* 1. HERO HEADER: 프리미엄 타이포그래피 */}
        <header className="pt-12 pb-16">
          <div className="space-y-4">
            <h1 className="text-[52px] lg:text-[64px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
              {isEdit ? 'Update' : 'Register'} <span className="text-[#FF6B00]">Profile.</span>
            </h1>
            <p className="text-[18px] text-stone-400 font-medium max-w-xl word-break-keep-all">
              소중한 가족의 프로필을 완성하세요. <br />
              아이의 성장을 멍케어차트가 기록하고 보관합니다.
            </p>
          </div>
        </header>

        {/* 2. MAIN LAYOUT: 2열 아카이브 구조 */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pb-32">
          
          {/* LEFT: VISUAL PROFILE PANEL (5/12) */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-12">
            <FileUploader 
              variant="panel"
              mode="single"
              fileInfos={photoUploader.fileInfos}
              onFileSelect={(files) => photoUploader.handleSelect(files, 1)}
              onFileDelete={photoUploader.handleDelete}
              loading={photoUploader.isUploading}
              maxCount={1}
            />
          </div>

          {/* RIGHT: DATA FORM PANEL (7/12) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-white rounded-[32px] p-10 lg:p-14 border border-[#F0F0F0] shadow-[0_30px_80px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-4 mb-12 border-b border-stone-50 pb-8">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] shadow-lg shadow-[#FF6B00]/20 ring-4 ring-[#FF6B00]/5"></span>
                <h4 className="text-[20px] font-black text-[#2D2D2D] tracking-tight">기본 프로필 상세 정보</h4>
              </div>

              <div className="space-y-10">
                {/* GRID 1: NAME & BREED */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="아이 이름 *" 
                    placeholder="아이의 소중한 이름" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="품종" 
                    placeholder="예: 토이푸들, 말티즈" 
                    value={formData.breed} 
                    onChange={(e) => setFormData({...formData, breed: e.target.value})} 
                  />
                </div>

                {/* GRID 2: BIRTH & WEIGHT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DatePicker 
                    label="생년월일" 
                    variant="form"
                    selected={formData.birthDate ? parseISO(formData.birthDate) : null} 
                    onChange={(date) => setFormData({...formData, birthDate: date ? format(date, 'yyyy-MM-dd') : ''})} 
                  />
                  <div className="relative">
                    <Input 
                      label="몸무게" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={formData.weight} 
                      onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                    />
                    <span className="absolute right-5 bottom-4 text-[13px] font-black text-stone-300 uppercase">kg</span>
                  </div>
                </div>
              </div>

              {/* ACTION BAR: 위계 정리된 버튼 그룹 */}
              <div className="mt-16 pt-10 border-t border-stone-50">
                <FormActions 
                  onCancel={() => navigate(-1)} 
                  onSave={handleSave} 
                  onDelete={isEdit ? () => setIsDeleteModalOpen(true) : undefined}
                  isSubmitting={isLoading} 
                  saveLabel={isEdit ? '프로필 업데이트하기' : '등록 완료하기'} 
                />
              </div>
            </div>
          </div>
        </main>

        <ConfirmModal
          open={isDeleteModalOpen}
          title="정보 삭제 확인"
          description={`${formData.name}의 모든 기록이 영구적으로 삭제됩니다.\n정말로 삭제하시겠습니까?`}
          confirmText="네, 삭제합니다"
          variant="danger"
          loading={isLoading}
          onConfirm={handleConfirmDeleteDog}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </PageLayout>
    </div>
  );
};

export default DogFormPage;
