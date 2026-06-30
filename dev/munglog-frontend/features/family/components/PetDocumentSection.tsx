'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Paperclip, Upload, X } from 'lucide-react';
import { fileApi } from '@/api/fileApi';
import { Spinner } from '@/components/common/Spinner';
import { isImageFile, getFileExtension, getFileIcon, downloadFile } from '@/utils/fileUtils';
import { getImagePath } from '@/lib/clientApi';
import type { FileItem } from '@/types/file';

interface PetDocumentSectionProps {
  petId: string;
}

const PetDocumentSection: React.FC<PetDocumentSectionProps> = ({ petId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fileApi.getFiles('PET_DOC', petId)
      .then(setFiles)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [petId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsUploading(true);
    try {
      const added = await fileApi.addFiles('PET_DOC', petId, selected);
      setFiles(prev => [...prev, ...added]);
    } catch {
      // 업로드 실패 시 기존 파일 유지
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string | number) => {
    try {
      const remaining = await fileApi.deleteFiles('PET_DOC', petId, [fileId]);
      setFiles(remaining);
    } catch {
      // 실패 시 조용히 무시
    }
  };

  const handleFileClick = (file: FileItem) => {
    const isImage = isImageFile(file.fileUrl, file.originalFileName);
    if (isImage) {
      setSelectedFile(file);
    } else {
      window.open(getImagePath(file.fileUrl), '_blank');
    }
  };

  return (
    <div className="border-t border-border pt-5 space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-3.5 h-3.5 text-text-sub" />
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">첨부파일</p>
          {files.length > 0 && (
            <span className="text-[10px] font-bold text-text-sub/60">({files.length})</span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 bg-zinc-50 hover:border-main-green hover:text-main-green text-text-sub text-[11px] font-bold transition-all disabled:opacity-40"
        >
          {isUploading
            ? <><Spinner className="w-2.5 h-2.5" /> 업로드 중</>
            : <><Upload className="w-3 h-3" /> 파일 추가</>
          }
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* 파일 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : files.length === 0 ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border/60 bg-zinc-50 hover:border-main-green hover:bg-main-green/5 transition-all group"
        >
          <Upload className="w-5 h-5 text-border group-hover:text-main-green transition-colors" />
          <div className="text-center">
            <p className="text-xs font-bold text-text-sub group-hover:text-main-green transition-colors">
              등록증·인증샷·서류 등을 첨부하세요
            </p>
            <p className="text-[10px] text-text-sub/50 font-medium mt-0.5">이미지, PDF 지원 · 여러 장 가능</p>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {files.map(file => (
            <PetDocFileThumb
              key={file.id}
              file={file}
              onClick={() => handleFileClick(file)}
              onDelete={() => handleDelete(file.id)}
            />
          ))}
          {/* 추가 업로드 버튼 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-xl border-2 border-dashed border-border/60 bg-zinc-50 flex flex-col items-center justify-center gap-1 hover:border-main-green hover:bg-main-green/5 transition-all group disabled:opacity-40"
          >
            <Upload className="w-4 h-4 text-border group-hover:text-main-green transition-colors" />
            <span className="text-[9px] font-bold text-text-sub/60 group-hover:text-main-green transition-colors">추가</span>
          </button>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedFile && mounted && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedFile(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              className="absolute -top-16 right-0 text-white/40 hover:text-white transition-colors text-3xl cursor-pointer"
              onClick={() => setSelectedFile(null)}
            >
              ✕
            </button>

            <img
              src={getImagePath(selectedFile.fileUrl)}
              alt={selectedFile.originalFileName}
              className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
            />

            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-white/80 text-[14px] font-black tracking-tight">{selectedFile.originalFileName}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(getImagePath(selectedFile.fileUrl), selectedFile.originalFileName);
                }}
                className="text-[11px] font-black text-main-green bg-white dark:bg-zinc-800 px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-light-green transition-colors cursor-pointer"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const PetDocFileThumb: React.FC<{ file: FileItem; onClick: () => void; onDelete: () => void }> = ({ file, onClick, onDelete }) => {
  const isImage = isImageFile(file.fileUrl, file.originalFileName);
  const ext     = getFileExtension(file.fileUrl, file.originalFileName);

  return (
    <div 
      onClick={onClick}
      className="relative aspect-square rounded-xl overflow-hidden border border-border/60 bg-white group cursor-pointer"
    >
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
          <span
            className="text-[9px] text-text-sub font-bold truncate w-full px-1 mt-1 break-all line-clamp-2"
            title={file.originalFileName}
          >
            {file.originalFileName}
          </span>
        </div>
      )}

      {/* 삭제 버튼 */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 w-5 h-5 bg-stone-900/75 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
        title="삭제"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};

export default PetDocumentSection;
