'use client';

import React, { useState, useEffect } from 'react';
import {
  Syringe, Plus, ChevronDown, ChevronUp,
  Paperclip, X, Check, Upload,
} from 'lucide-react';
import TimelineDatePicker from '@/features/calendar/components/TimelineDatePicker';
import { useVaccinationRecords, VaccinationFormData } from '@/features/family/hooks/useVaccinationRecords';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploader } from '@/components/common/FileUploader';
import { fileApi } from '@/api/fileApi';
import { Spinner } from '@/components/common/Spinner';
import { isImageFile, getFileExtension, getFileIcon } from '@/utils/fileUtils';
import { getImagePath } from '@/lib/clientApi';
import type { FileItem } from '@/types/file';
import type { CareRecord } from '@/types/care';

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
  const fileUploader = useFileUpload('CARE_RECORD');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VaccinationFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('접종명을 입력해 주세요.'); return; }
    if (!form.recordDate)   { setFormError('접종일을 선택해 주세요.'); return; }
    setFormError('');
    setIsSaving(true);
    try {
      const savedRecord = await createVaccination(form);
      if (fileUploader.localFiles.length > 0) {
        await fileUploader.syncToServer(savedRecord.id);
      }
      setForm(EMPTY_FORM);
      fileUploader.clear();
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
    fileUploader.clear();
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

          {/* 첨부파일 */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-sub uppercase tracking-widest">
              첨부파일 <span className="font-medium normal-case tracking-normal text-text-sub/50">(접종확인서·영수증·스티커 사진 등)</span>
            </label>
            <FileUploader
              variant="grid"
              mode="multiple"
              maxCount={5}
              fileInfos={fileUploader.fileInfos}
              onFileSelect={files => fileUploader.handleSelect(files, 5)}
              onFileDelete={fileUploader.handleDelete}
              loading={fileUploader.isUploading}
              accept="image/*,.pdf"
            />
          </div>

          {formError && <p className="text-[11px] text-red-500 font-bold">{formError}</p>}

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
              {isSaving
                ? <><Spinner className="w-3 h-3" /> 저장 중...</>
                : <><Check className="w-3.5 h-3.5" /> 저장</>
              }
            </button>
          </div>
        </div>
      )}

      {/* 기록 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
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

/* ── 개별 예방접종 기록 카드 ── */
const VaccinationRecordItem: React.FC<{ record: CareRecord }> = ({ record }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!expanded || filesLoaded) return;
    setIsLoadingFiles(true);
    fileApi.getFiles('CARE_RECORD', record.id)
      .then(f => { setFiles(f); setFilesLoaded(true); })
      .catch(() => setFilesLoaded(true))
      .finally(() => setIsLoadingFiles(false));
  }, [expanded, filesLoaded, record.id]);

  const handleDeleteFile = async (fileId: string | number) => {
    try {
      const remaining = await fileApi.deleteFiles('CARE_RECORD', record.id, [fileId]);
      setFiles(remaining);
    } catch {
      // 실패 시 조용히 무시
    }
  };

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsUploading(true);
    try {
      const added = await fileApi.addFiles('CARE_RECORD', record.id, selected);
      setFiles(prev => [...prev, ...added]);
    } catch {
      // 업로드 실패 — 기존 기록은 유지됨
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-zinc-50 border border-border/60 rounded-xl overflow-hidden">
      {/* 헤더 (클릭 → 펼치기) */}
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
          {(files.length > 0 || (!filesLoaded && (record.attachmentCount ?? 0) > 0)) && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-sub">
              <Paperclip className="w-3 h-3" />
              {filesLoaded ? files.length : record.attachmentCount}
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-text-sub" />
            : <ChevronDown className="w-3.5 h-3.5 text-text-sub" />
          }
        </div>
      </button>

      {/* 펼침 내용 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3 animate-in fade-in duration-150">
          {/* 텍스트 상세 */}
          {record.clinicName && <DetailRow label="동물병원" value={record.clinicName} />}
          {record.note        && <DetailRow label="메모"     value={record.note} />}
          {!record.clinicName && !record.note && (
            <p className="text-xs text-text-sub/60 font-medium">추가 정보가 없습니다.</p>
          )}

          {/* 첨부파일 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">첨부파일</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/80 bg-white hover:border-main-green hover:text-main-green text-text-sub text-[10px] font-bold transition-all disabled:opacity-40"
              >
                {isUploading
                  ? <><Spinner className="w-2.5 h-2.5" /> 업로드 중</>
                  : <><Upload className="w-2.5 h-2.5" /> 파일 추가</>
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleAddFiles}
              />
            </div>

            {isLoadingFiles ? (
              <div className="flex justify-center py-3"><Spinner /></div>
            ) : files.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 border-dashed border-border/60 bg-white hover:border-main-green hover:bg-main-green/5 transition-all group"
              >
                <Upload className="w-4 h-4 text-border group-hover:text-main-green transition-colors" />
                <p className="text-[11px] font-bold text-text-sub/60 group-hover:text-main-green transition-colors">
                  인증샷·접종확인서·영수증 등을 올려보세요
                </p>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {files.map(file => (
                  <FileThumb key={file.id} file={file} onDelete={() => handleDeleteFile(file.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── 파일 썸네일 카드 ── */
const FileThumb: React.FC<{ file: FileItem; onDelete: () => void }> = ({ file, onDelete }) => {
  const isImage = isImageFile(file.fileUrl, file.originalFileName);
  const ext     = getFileExtension(file.fileUrl, file.originalFileName);

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden border border-border/60 bg-white group">
      {isImage ? (
        <img
          src={getImagePath(file.fileUrl)}
          alt={file.originalFileName}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-zinc-50 text-center">
          <span className="text-2xl mb-1">{getFileIcon(ext)}</span>
          <span className="text-[10px] font-black text-text-sub uppercase tracking-tighter">{ext}</span>
          <span className="text-[9px] text-text-sub font-bold truncate w-full px-1 mt-1 break-all line-clamp-2"
            title={file.originalFileName}>
            {file.originalFileName}
          </span>
        </div>
      )}

      {/* 삭제 버튼 */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 w-5 h-5 bg-stone-900/75 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
        title="파일 삭제"
      >
        <X className="w-2.5 h-2.5" />
      </button>

      {/* 이미지: 클릭 시 새 탭 열기 */}
      {isImage && (
        <a
          href={getImagePath(file.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          onClick={e => e.stopPropagation()}
        />
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
