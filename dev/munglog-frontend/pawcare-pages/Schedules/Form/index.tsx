import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
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
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Schedule Form</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {isEdit ? '일정 수정하기' : '새 일정 등록하기'}
            </h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">우리 아이의 건강을 위한 일정을 계획하고 꼼꼼하게 관리하세요.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={() => navigate(-1)} className="px-4 font-bold text-text-sub text-xs">취소</Button>
            <Button onClick={handleSave} disabled={isLoading} className="px-6 h-[40px] text-xs font-black rounded-xl">
              {isLoading ? '저장 중...' : (isEdit ? '수정' : '등록')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area with inner scroll */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 bg-surface-green/10">
        <div className="max-w-4xl mx-auto space-y-6">

          <Section title="기본 정보" description="누구의 어떤 일정인가요?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData.scheduleTypeId?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, scheduleTypeId: Number(e.target.value) })}
                options={[
                  { label: '유형을 선택해주세요', value: '' },
                  ...scheduleTypes.map(t => ({ 
                    label: t.codeName, 
                    value: t.id.toString() 
                  }))
                ]}
              />
            </div>
          </Section>

          <Section title="상세 일정" description="언제, 어디서, 어떤 활동을 계획하시나요?">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-4">
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
                rows={4}
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

          <div className="pt-6 flex justify-center">
            <Button
              size="md"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full max-w-sm h-[48px] text-[14px] font-black rounded-2xl"
            >
              {isLoading ? '저장 중...' : (isEdit ? '일정 수정 완료' : '일정 예약 완료')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFormPage;
