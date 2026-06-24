import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import { MedicalForm } from './components/MedicalForm';
import { ExpenseForm } from './components/ExpenseForm';
import { CommonInfoForm } from './components/CommonInfoForm';
import { FileUploader } from '@/components/common/FileUploader';
import { useCareRecordForm } from './hooks/useCareRecordForm';
import { useCommonCodes } from '@/hooks/useCommonCodes';

const CareRecordFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  } = useCareRecordForm(id);

  const { codes: allRecordTypes } = useCommonCodes('RECORD_TYPE');
  const recordTypes = allRecordTypes.filter(t => t.code !== 'MEMO');

  const isMedicalSelected = React.useMemo(() => {
    const activeType = recordTypes.find(t => t.id === recordTypeId);
    if (!activeType) return true; 
    return activeType.code === 'MEDICAL';
  }, [recordTypeId, recordTypes]);

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#FCFAF8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[900px]">
        {/* HERO HEADER */}
        <header className="pt-12 pb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-stone-100 mb-12">
          <div className="space-y-4">
            <h1 className="text-[48px] lg:text-[56px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
              {isEdit ? 'Edit' : 'New'} <span className="text-[#FF6B00]">Record.</span>
            </h1>
            <p className="text-[17px] text-stone-400 font-medium max-w-xl">
              반려견의 건강 정보를 기록하세요.
            </p>
          </div>
          <div className="flex gap-3 pb-1">
            <Button variant="ghost" onClick={() => navigate(-1)} className="px-6 font-bold text-stone-400">취소</Button>
            <Button onClick={handleSave} disabled={isLoading} className="px-10 h-[64px] text-[16px] shadow-2xl">
              {isLoading ? '저장 중...' : (isEdit ? '수정 완료' : '기록 저장')}
            </Button>
          </div>
        </header>

        <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* 기록 종류 선택 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12 border-b border-stone-100/60">
            {recordTypes.map((type) => {
              const isActive = recordTypeId === type.id;
              const isMed = type.code === 'MEDICAL';
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRecordTypeId(type.id)}
                  className={`group relative flex items-center p-6 rounded-[32px] text-left transition-all duration-500 active:scale-[0.98] overflow-hidden ${
                    isActive
                      ? 'bg-white shadow-[0_20px_40px_-12px_rgba(255,107,0,0.12)] border border-[#FF6B00]/20'
                      : 'bg-transparent border border-stone-200/60 hover:border-stone-300 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-r from-[#FF6B00]/5 to-transparent pointer-events-none" />
                  )}
                  
                  <div className="relative flex items-center justify-between w-full">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-[20px] text-[24px] transition-all duration-500 ${
                        isActive 
                          ? 'bg-[#FF6B00] text-white shadow-xl shadow-[#FF6B00]/30 scale-105' 
                          : 'bg-white border border-stone-100 text-stone-400 shadow-sm group-hover:scale-105 group-hover:border-stone-200 group-hover:text-stone-500'
                      }`}>
                        {isMed ? '🏥' : '💳'}
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[19px] font-black tracking-tight transition-colors duration-500 ${
                          isActive ? 'text-[#2D2D2D]' : 'text-stone-400 group-hover:text-stone-600'
                        }`}>
                          {type.codeName}
                        </span>
                        <span className={`text-[13px] font-bold tracking-tight transition-colors duration-500 ${
                          isActive ? 'text-[#FF6B00]' : 'text-stone-400/80 group-hover:text-stone-500/80'
                        }`}>
                          {isMed ? '증상 및 처방 관리' : '병원비 및 지출 내역'}
                        </span>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'border-[#FF6B00]' : 'border-stone-200'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-[#FF6B00] transition-transform duration-500 ${
                        isActive ? 'scale-100' : 'scale-0'
                      }`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 공통 정보 */}
          <CommonInfoForm data={commonData} onChange={setCommonData} />

          {/* 조건부 상세 폼 (평면 구조 유지) */}
          <div className="pt-10 border-t border-stone-100">
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

          <div className="pt-10 flex justify-center border-t border-stone-100">
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full max-w-sm h-[64px] text-[17px] shadow-2xl"
            >
              {isLoading ? '저장 중...' : (isEdit ? '수정 완료' : '기록 저장하기')}
            </Button>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default CareRecordFormPage;
