'use client';

import React, { useState } from 'react';
import { Syringe, Plus, ChevronDown, ChevronUp, Paperclip, X, Check } from 'lucide-react';
import TimelineDatePicker from '@/features/calendar/components/TimelineDatePicker';
import { useVaccinationRecords, VaccinationFormData } from '@/features/family/hooks/useVaccinationRecords';
import { Spinner } from '@/components/common/Spinner';

interface VaccinationSectionProps {
  petId: string;
}

const EMPTY_FORM: VaccinationFormData = {
  title: '',
  recordDate: '',
  clinicName: '',
  note: '',
};

const VaccinationSection: React.FC<VaccinationSectionProps> = ({ petId }) => {
  const { records, isLoading, createVaccination } = useVaccinationRecords(petId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VaccinationFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError('접종명을 입력해 주세요.');
      return;
    }
    if (!form.recordDate) {
      setFormError('접종일을 선택해 주세요.');
      return;
    }
    setFormError('');
    setIsSaving(true);
    try {
      await createVaccination(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setFormError('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(false);
  };

  return (
    <div className="border-t border-border pt-5 space-y-3">

      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Syringe className="w-3.5 h-3.5 text-text-sub" />
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">예방접종 기록</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 bg-zinc-50 hover:border-main-green hover:text-main-green text-text-sub text-[11px] font-bold transition-all"
          >
            <Plus className="w-3 h-3" /> 접종 기록 추가
          </button>
        )}
      </div>

      {/* 인라인 등록 폼 */}
      {showForm && (
        <div className="bg-zinc-50 border border-border rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black text-foreground">과거 예방접종 기록 추가</p>
            <button onClick={handleCancel} className="p-1 text-text-sub hover:text-foreground rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 접종명 */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-sub uppercase tracking-widest">접종명 *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="예: 종합백신 5종, 광견병"
              className="w-full px-3 py-2.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-text-sub/40 focus:border-main-green focus:ring-2 focus:ring-main-green/10 outline-none transition-all"
            />
          </div>

          {/* 접종일 */}
          <TimelineDatePicker
            label="접종일 *"
            value={form.recordDate}
            onChange={date => setForm(f => ({ ...f, recordDate: date }))}
            variant="form"
            align="top"
          />

          {/* 동물병원명 */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-sub uppercase tracking-widest">동물병원명</label>
            <input
              type="text"
              value={form.clinicName}
              onChange={e => setForm(f => ({ ...f, clinicName: e.target.value }))}
              placeholder="방문한 동물병원 이름"
              className="w-full px-3 py-2.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-text-sub/40 focus:border-main-green focus:ring-2 focus:ring-main-green/10 outline-none transition-all"
            />
          </div>

          {/* 메모 */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-sub uppercase tracking-widest">메모</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="특이사항, 다음 접종 예정 등"
              className="w-full px-3 py-2.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-text-sub/40 focus:border-main-green focus:ring-2 focus:ring-main-green/10 outline-none transition-all resize-none"
            />
          </div>

          {formError && (
            <p className="text-[11px] text-red-500 font-bold">{formError}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-xs transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-main-green text-white font-bold rounded-xl text-xs shadow-sm shadow-main-green/20 hover:bg-main-green/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <><Spinner className="w-3 h-3" /> 저장 중...</>
              ) : (
                <><Check className="w-3.5 h-3.5" /> 저장</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 기록 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 bg-zinc-50 rounded-2xl border border-border/60 text-center gap-2">
          <Syringe className="w-6 h-6 text-border" />
          <p className="text-sm font-bold text-text-sub">등록된 예방접종 기록이 없습니다.</p>
          <p className="text-[11px] text-text-sub/60 font-medium">위 버튼으로 과거 접종 이력을 추가할 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <VaccinationRecordItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

/** 개별 예방접종 기록 카드 */
const VaccinationRecordItem: React.FC<{ record: ReturnType<typeof useVaccinationRecords>['records'][number] }> = ({ record }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-50 border border-border/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-100 transition-all text-left"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-main-green/10 flex items-center justify-center shrink-0 mt-0.5">
            <Syringe className="w-3.5 h-3.5 text-main-green" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground truncate">{record.title}</p>
            <p className="text-[11px] text-text-sub font-medium mt-0.5">{record.recordDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {(record.attachmentCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-sub">
              <Paperclip className="w-3 h-3" />
              {record.attachmentCount}
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-text-sub" />
            : <ChevronDown className="w-3.5 h-3.5 text-text-sub" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-border/40 pt-3 animate-in fade-in duration-150">
          {record.clinicName && (
            <DetailRow label="동물병원" value={record.clinicName} />
          )}
          {record.note && (
            <DetailRow label="메모" value={record.note} />
          )}
          {!record.clinicName && !record.note && (
            <p className="text-xs text-text-sub/60 font-medium">추가 정보가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2">
    <span className="text-[10px] font-black text-text-sub/60 uppercase tracking-widest shrink-0 w-16 pt-0.5">{label}</span>
    <span className="text-xs font-bold text-foreground leading-relaxed">{value}</span>
  </div>
);

export default VaccinationSection;
