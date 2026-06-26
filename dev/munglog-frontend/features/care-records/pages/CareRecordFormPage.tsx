import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import { MedicalForm } from '../components/MedicalForm';
import { ExpenseForm } from '../components/ExpenseForm';
import { CommonInfoForm } from '../components/CommonInfoForm';
import { FileUploader } from '@/components/common/FileUploader';
import { useCareRecordForm } from '../hooks/useCareRecordForm';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { isMedicalRecordType } from '@/lib/codeGroups';

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
    isFetching
  } = useCareRecordForm(id, { prefillDate, onSaveSuccess });

  const { codes: allRecordTypes } = useCommonCodes('RECORD_TYPE');
  const recordTypes = allRecordTypes.filter(t => t.code !== 'MEMO');

  const isMedicalSelected = React.useMemo(() => {
    const activeType = recordTypes.find(t => t.id === recordTypeId);
    if (!activeType) return true;
    return isMedicalRecordType(activeType.code);
  }, [recordTypeId, recordTypes]);

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
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
