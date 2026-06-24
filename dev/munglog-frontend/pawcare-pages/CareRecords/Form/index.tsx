import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-main-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border p-6 lg:px-10 lg:py-6 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Care Records Form</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {isEdit ? '케어기록 수정' : '새 케어기록 등록'}
            </h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">반려견의 건강 정보를 기록하세요.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={() => navigate(-1)} className="px-4 font-bold text-text-sub text-xs">취소</Button>
            <Button onClick={handleSave} disabled={isLoading} className="px-6 h-[40px] text-xs font-black rounded-xl">
              {isLoading ? '저장 중...' : (isEdit ? '수정' : '저장')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 기록 종류 선택 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-border">
            {recordTypes.map((type) => {
              const isActive = recordTypeId === type.id;
              const isMed = type.code === 'MEDICAL';
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRecordTypeId(type.id)}
                  className={`group relative flex items-center p-4 rounded-2xl text-left transition-all duration-300 active:scale-[0.98] overflow-hidden ${
                    isActive
                      ? 'bg-surface-green/30 shadow-sm border border-main-green/20'
                      : 'bg-background border border-border hover:border-main-green/30 hover:bg-surface-green/10'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-r from-main-green/5 to-transparent pointer-events-none" />
                  )}
                  
                  <div className="relative flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-[20px] transition-all duration-300 ${
                        isActive 
                          ? 'bg-main-green text-white shadow-md' 
                          : 'bg-background border border-border text-text-sub shadow-sm'
                      }`}>
                        {isMed ? '🏥' : '💳'}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`text-[15px] font-black tracking-tight ${
                          isActive ? 'text-foreground' : 'text-text-sub'
                        }`}>
                          {type.codeName}
                        </span>
                        <span className="text-[11px] font-bold text-text-sub/80">
                          {isMed ? '증상 및 처방 관리' : '병원비 및 지출 내역'}
                        </span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center ${
                      isActive ? 'border-main-green' : 'border-border'
                    }`}>
                      <div className={`w-2 h-2 rounded-full bg-main-green transition-transform duration-300 ${
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
          <div className="pt-6 border-t border-border">
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
