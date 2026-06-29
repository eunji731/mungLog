import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import { DatePicker } from '@/components/common/DatePicker';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { TagInput } from '@/components/common/TagInput';
import { useScheduleForm } from '../hooks/useScheduleForm';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { FileUploader } from '@/components/common/FileUploader';
import { SymptomSnap } from '@/features/care-records/components/SymptomSnapboard';

interface ScheduleFormPageProps {
  id?: string;
}

const ScheduleFormPage: React.FC<ScheduleFormPageProps> = ({ id }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!id;
  const prefillDate = searchParams?.get('date') || undefined;

  const {
    formData,
    setFormData,
    dogs,
    inventoryItems,
    fileUploader,
    handleSave,
    isLoading,
    isFetching,
    titleSuggestions
  } = useScheduleForm(id, { prefillDate });

  const { codes: scheduleTypes } = useCommonCodes('SCHEDULE_TYPE');

  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const titleFieldRef = useRef<HTMLDivElement>(null);
  
  // 증상 스냅 목록 상태
  const [availableSnaps, setAvailableSnaps] = useState<SymptomSnap[]>([]);

  useEffect(() => {
    if (!formData.dogId) {
      setAvailableSnaps([]);
      return;
    }

    try {
      const snapData = localStorage.getItem('munglog_symptom_snaps');
      if (snapData) {
        const parsed: SymptomSnap[] = JSON.parse(snapData);
        // 해당 강아지의 스냅 중 (관찰 중이거나, 현재 일정에 연동되어 있는 것) 필터링
        const filtered = parsed.filter(s => 
          String(s.petId) === String(formData.dogId) && 
          (s.status === 'MONITORING' || (id && String(s.linkedScheduleId) === String(id)))
        );
        setAvailableSnaps(filtered);
      } else {
        setAvailableSnaps([]);
      }
    } catch (e) {
      console.error('Failed to load snaps in ScheduleFormPage', e);
    }
  }, [formData.dogId, id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (titleFieldRef.current && !titleFieldRef.current.contains(event.target as Node)) {
        setShowTitleSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTitleSuggestions = titleSuggestions.filter((t) =>
    t.toLowerCase().includes(formData.title.trim().toLowerCase())
  );

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
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">Schedule Form</span>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
              {isEdit ? '일정 수정하기' : '새 일정 등록하기'}
            </h1>
            <p className="text-text-sub text-xs lg:text-sm font-bold mt-1">우리 아이의 건강을 위한 일정을 계획하고 꼼꼼하게 관리하세요.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={() => router.back()} className="px-4 font-bold text-text-sub text-xs">취소</Button>
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
                <div className="relative" ref={titleFieldRef}>
                  <Input
                    label="일정 제목"
                    placeholder="예: 하트가드, 사료 구매, 정기검진"
                    helperText="반복되는 일정은 매번 같은 제목을 써야 스트릭으로 추적돼요."
                    value={formData.title}
                    onFocus={() => setShowTitleSuggestions(true)}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      setShowTitleSuggestions(true);
                    }}
                  />
                  {showTitleSuggestions && filteredTitleSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-2xl rounded-2xl py-2 z-20 max-h-56 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1">
                      {filteredTitleSuggestions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, title: t });
                            setShowTitleSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-green transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
              <div className="space-y-1.5">
                <Select
                  label="재고 연동 (선택)"
                  value={formData.inventoryItemId}
                  onChange={(e) => setFormData({ ...formData, inventoryItemId: e.target.value })}
                  options={[
                    { label: '연동 안 함', value: '' },
                    ...inventoryItems.map(i => ({ label: `${i.name} (재고 ${i.stock}개)`, value: i.id.toString() }))
                  ]}
                />
                <p className="text-[11px] text-text-sub ml-1 font-medium">
                  하트가드, 사료처럼 소모되는 아이템을 연동하면 완료 처리할 때마다 재고가 줄고, 소진 시기를 미리 알려드려요.
                </p>
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

              {/* 증상 스냅보드 연동 영역 */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-text-sub ml-1 uppercase tracking-wider block">
                  증상 스냅보드 연동 (선택)
                </label>
                
                {!formData.dogId ? (
                  <div className="p-4 border border-dashed border-border rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 text-center text-xs font-bold text-text-sub">
                    반려견을 먼저 선택하시면 관찰 중인 이상 증상 스냅을 연동할 수 있습니다.
                  </div>
                ) : availableSnaps.length === 0 ? (
                  <div className="p-4 border border-dashed border-border rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 text-center text-xs font-bold text-text-sub">
                    현재 관찰 중인 반려견의 이상 증상(스냅)이 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
                    {availableSnaps.map((snap) => {
                      const isSelected = formData.linkedSymptomSnapId === snap.id;
                      return (
                        <div
                          key={snap.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              linkedSymptomSnapId: isSelected ? '' : snap.id
                            });
                          }}
                          className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex gap-3 relative overflow-hidden group select-none ${
                            isSelected
                              ? 'border-main-green bg-main-green/5 ring-2 ring-main-green/20'
                              : 'border-border bg-background hover:border-main-green/30'
                          }`}
                        >
                          {/* Left: Thumbnail if photo exists */}
                          {snap.photoUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-stone-100 relative">
                              <img src={snap.photoUrl} alt="symptom" className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          {/* Right: Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {snap.symptomTags?.map((tag, idx) => (
                                <span key={idx} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-main-green/10 text-main-green">
                                  #{tag}
                                </span>
                              ))}
                              <span className="text-[9px] text-text-sub font-bold">
                                {snap.date} {snap.time}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-text-main truncate mt-1">
                              {snap.memo || '이상 증상 관찰됨'}
                            </p>
                          </div>

                          {/* Selected Check Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-main-green flex items-center justify-center text-white text-[9px] font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-text-sub font-medium ml-1">
                  💡 연동된 증상 스냅은 이 일정을 완료하여 '케어 기록'으로 전환할 때 자동으로 '해결됨(RESOLVED)' 상태가 되며, 생성된 케어 기록과 연결됩니다.
                </p>
              </div>

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
