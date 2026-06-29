import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { DatePicker } from '@/components/common/DatePicker';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { FileUploader } from '@/components/common/FileUploader';
import { useDogForm } from '@/features/pets/hooks/useDogForm';
import { Spinner } from '@/components/common/Spinner';

interface DogFormPageProps {
  id?: string;
}

const DogFormPage = ({ id }: DogFormPageProps) => {
  const router = useRouter();
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
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Family Form</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {isEdit ? '반려견 정보 수정' : '새 가족 등록'}
            </h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">소중한 가족의 프로필을 완성하세요. 아이의 성장을 PetLifeLog가 함께 기록합니다.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isEdit && (
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(true)} disabled={isLoading} className="px-4 font-bold text-red-400 hover:text-red-500 text-xs">삭제</Button>
            )}
            <Button variant="ghost" onClick={() => router.back()} className="px-4 font-bold text-text-sub text-xs">취소</Button>
            <Button onClick={handleSave} disabled={isLoading} className="px-6 h-[40px] text-xs font-black rounded-xl">
              {isLoading ? '저장 중...' : (isEdit ? '수정' : '등록')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-6xl mx-auto">
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT: VISUAL PROFILE PANEL (5/12) */}
            <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-0">
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
              <div className="bg-background rounded-3xl p-8 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                  <span className="w-2 h-2 rounded-full bg-main-green shadow-lg shadow-main-green/20"></span>
                  <h4 className="text-[16px] font-black text-foreground tracking-tight">기본 프로필 상세 정보</h4>
                </div>

                <div className="space-y-6">
                  {/* GRID 1: NAME & BREED */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <span className="absolute right-5 bottom-3.5 text-[11px] font-black text-text-sub uppercase">kg</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

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
    </div>
  );
};

export default DogFormPage;
