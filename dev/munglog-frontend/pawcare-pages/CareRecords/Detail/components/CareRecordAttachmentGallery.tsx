import React, { useState } from 'react';
import type { FileItem } from '@/types/file';
import { isImageFile, getFileIcon, getFileExtension } from '@/utils/fileUtils';

interface CareRecordAttachmentGalleryProps {
  files: FileItem[];
}

export const CareRecordAttachmentGallery: React.FC<CareRecordAttachmentGalleryProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  if (files.length === 0) return null;

  const handleFileClick = (file: FileItem) => {
    const isImage = isImageFile(file.fileUrl) || file.fileType.startsWith('image/');
    if (isImage) {
      setSelectedFile(file);
    } else {
      // 비이미지 파일은 즉시 새 탭에서 열기 (브라우저 기본 동작: PDF 미리보기 또는 다운로드)
      window.open(file.fileUrl, '_blank');
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[15px] font-black text-[#2D2D2D] tracking-widest uppercase flex items-center gap-2.5">
          <span className="text-[18px]">📁</span> Attachment Gallery
        </h2>
        <span className="text-[12px] font-black text-stone-400 uppercase tracking-widest">{files.length} Files</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
        {files.map((file) => {
          const isImage = isImageFile(file.fileUrl) || file.fileType.startsWith('image/');
          const extension = getFileExtension(file.fileUrl);

          return (
            <div 
              key={file.id}
              onClick={() => handleFileClick(file)}
              className="flex flex-col gap-2 group cursor-pointer"
            >
              <div className="aspect-square rounded-[20px] overflow-hidden border border-stone-100 bg-stone-50 transition-all hover:border-[#FF6B00]/30 hover:shadow-xl hover:shadow-orange-500/5 focus:outline-none relative">
                {isImage ? (
                  <img 
                    src={file.fileUrl} 
                    alt={file.originalFileName} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <span className="text-4xl transition-all transform group-hover:scale-110">
                      {getFileIcon(extension)}
                    </span>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">{extension}</span>
                  </div>
                )}
              </div>
              <span 
                className="text-[11px] font-bold text-stone-500 text-center truncate px-1 group-hover:text-[#FF6B00] transition-colors" 
                title={file.originalFileName}
              >
                {file.originalFileName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Image Viewer Modal */}
      {selectedFile && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/95 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedFile(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-16 right-0 text-white/40 hover:text-white transition-colors text-3xl"
              onClick={() => setSelectedFile(null)}
            >
              ✕
            </button>
            
            <img 
              src={selectedFile.fileUrl} 
              alt={selectedFile.originalFileName} 
              className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
            />
            
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-white/80 text-[14px] font-black tracking-tight">{selectedFile.originalFileName}</p>
              <a 
                href={selectedFile.fileUrl} 
                download={selectedFile.originalFileName}
                className="text-[11px] font-black text-[#FF6B00] bg-white px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-orange-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
