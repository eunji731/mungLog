import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import { DatePicker } from '@/components/common/DatePicker';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { TagInput } from '@/components/common/TagInput';
import { useScheduleForm } from './hooks/useScheduleForm';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { FileUploader } from '@/components/common/FileUploader';

const ScheduleFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    formData,
    setFormData,
    dogs,
    fileUploader,
    handleSave,
    isLoading,
    isFetching
  } = useScheduleForm(id);

  // DB에서 일정 유형(SCHEDULE_TYPE) 코드 목록 실시간 호출
  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#FCFAF8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-[#FF6B00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8]">
      <PageLayout title="" maxWidth="max-w-[1000px]">
        <header className="pt-12 pb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-stone-100 mb-12">
          <div className="space-y-4">
            <h1 className="text-[48px] lg:text-[56px] font-black text-[#2D2D2D] leading-[0.95] tracking-tight">
              {isEdit ? 'Edit' : 'New'} <span className="text-[#FF6B00]">Plan.</span>
            </h1>
            <p className="text-[17px] text-stone-400 font-medium max-w-xl">
              우리 아이의 건강을 위한 미래의 일정을 계획하고 꼼꼼하게 관리하세요.
            </p>
          </div>
          <div className="flex gap-3 pb-1">
            <Button variant="ghost" onClick={() => navigate(-1)} className="px-6 font-bold text-stone-400">취소</Button>
            <Button onClick={handleSave} disabled={isLoading} className="px-10 h-[64px] text-[16px] shadow-2xl">
              {isLoading ? '저장 중...' : (isEdit ? '일정 수정하기' : '일정 예약하기')}
            </Button>
          </div>
        </header>

        <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">

          <Section title="기본 정보" description="누구의 어떤 일정인가요?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="반려견 선택"
                value={formData.dogId}
                onChange={(e) => setFormData({ ...formData, dogId: e.target.value })}
                options={[
                  { label: '아이를 선택해주세요', value: '' },
                  ...dogs.map(d => ({ label: d.name, value: d.id.toString() }))
                ]}
              />
              <Select
                label="일정 유형"
                // 현재 선택된 ID값을 문자열로 변환하여 Select 컴포넌트와 호환
                value={formData.scheduleTypeId?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, scheduleTypeId: Number(e.target.value) })}
                options={[
                  { label: '유형을 선택해주세요', value: '' },
                  // DB에서 가져온 실제 공통코드 데이터(ID, 명칭) 매핑
                  ...scheduleTypes.map(t => ({ 
                    label: t.codeName, 
                    value: t.id.toString() 
                  }))
                ]}
              />
            </div>
          </Section>

          <Section title="상세 일정" description="언제, 어디서, 어떤 활동을 계획하시나요?">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="일정 제목"
                  placeholder="예: 튼튼동물병원 정기검진"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="장소 (선택)"
                  placeholder="예: 강남구 테헤란로 123"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePicker
                  label="날짜"
                  variant="form"
                  selected={formData.scheduleDate ? parseISO(formData.scheduleDate) : null}
                  onChange={(date) => setFormData({ ...formData, scheduleDate: date ? format(date, 'yyyy-MM-dd') : '' })}
                />
                <Input
                  label="시간"
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                />
              </div>
            </div>
          </Section>

          <Section title="추가 메모" description="일정 시 참고할 사항이나 증상을 미리 적어보세요.">
            <div className="space-y-8">
              <TagInput
                label="관련 증상 키워드 (선택)"
                placeholder="증상을 입력하고 엔터를 누르세요 (예: 구토, 설사)"
                tags={formData.symptomTags}
                onChange={(tags) => setFormData({ ...formData, symptomTags: tags })}
              />
              <Textarea
                label="상세 메모"
                placeholder="수의사 선생님께 여쭤볼 내용이나 미용 시 주의사항을 적어주세요."
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                rows={5}
              />
            </div>
          </Section>

          <Section title="참조 파일" description="진료 예약증, 이전 처방전, 미용 참고 사진 등을 첨부하세요.">
            <div className="pt-2">
              <FileUploader
                variant="grid"
                mode="multiple"
                maxCount={5}
                fileInfos={fileUploader.fileInfos}
                onFileSelect={(files) => fileUploader.handleSelect(files, 5)}
                onFileDelete={fileUploader.handleDelete}
                loading={fileUploader.isUploading}
              />
            </div>
          </Section>

          <div className="pt-10 flex justify-center">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full max-w-sm h-[64px] text-[17px] shadow-2xl"
            >
              {isLoading ? '저장 중...' : (isEdit ? '일정 수정 완료' : '일정 예약 완료')}
            </Button>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default ScheduleFormPage;
