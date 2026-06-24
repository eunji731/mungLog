import React, { useRef } from 'react';
import { isImageFile, getFileExtension, getFileIcon, getFileNameFromUrl } from '@/utils/fileUtils';

interface FileInfo {
  url: string;
  name: string;
  isExisting: boolean;
}

interface FileUploaderProps {
  variant?: 'profile' | 'grid' | 'panel';
  mode?: 'single' | 'multiple';
  displayUrls?: string[]; 
  fileInfos?: FileInfo[]; 
  onFileSelect: (files: File[]) => void;
  onFileDelete: (index: number) => void;
  loading?: boolean;
  maxCount?: number;
  accept?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  variant = 'grid',
  mode = 'single',
  displayUrls = [],
  fileInfos = [],
  onFileSelect,
  onFileDelete,
  loading = false,
  maxCount = 1,
  accept = 'image/*,.pdf,.xls,.xlsx,.doc,.docx,.hwp',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // fileInfos가 있으면 우선 사용, 없으면 displayUrls로 기본 객체 생성 (하위 호환)
  const effectiveFiles = fileInfos.length > 0 
    ? fileInfos 
    : displayUrls.map(url => ({ url, name: getFileNameFromUrl(url), isExisting: true }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onFileDelete(index);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderFileItem = (file: FileInfo, idx: number) => {
    const isImage = isImageFile(file.url, file.name); // 파일명 추가 전달
    const extension = getFileExtension(file.url, file.name); // 파일명 추가 전달
    const fileName = file.name;

    return (
      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-100 shadow-sm bg-white group">
        {isImage ? (
          <img src={file.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="attachment" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-stone-50 text-center">
            <span className="text-3xl mb-1">{getFileIcon(extension)}</span>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">{extension}</span>
            <span 
              className="text-[9px] text-stone-500 font-bold truncate w-full mt-1 px-1 leading-tight break-all line-clamp-2" 
              title={fileName}
            >
              {fileName}
            </span>
          </div>
        )}
        <button 
          onClick={(e) => handleDelete(e, idx)} 
          className="absolute top-1.5 right-1.5 w-6 h-6 bg-stone-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50 shadow-sm"
        >
          ✕
        </button>
      </div>
    );
  };

  if (variant === 'panel') {
    const file = effectiveFiles[0];
    const isImage = file ? isImageFile(file.url, file.name) : false;
    const extension = file ? getFileExtension(file.url, file.name) : '';

    return (
      <div className="relative w-full aspect-4/5 rounded-[32px] overflow-hidden group bg-[#F9F7F5] border border-stone-100 shadow-inner">
        {file ? (
          <>
            {isImage ? (
              <img src={file.url} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white p-10 text-center">
                <span className="text-7xl mb-4">{getFileIcon(extension)}</span>
                <p className="text-[14px] font-black text-stone-400 uppercase tracking-widest">{extension} Document</p>
                <p className="text-[12px] text-stone-300 font-bold mt-2 truncate w-full">{file.name}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="text-white">
                <p className="text-[10px] font-black tracking-[0.2em] opacity-60 uppercase mb-1">{isImage ? 'Selected Image' : 'Selected File'}</p>
                <p className="text-[14px] font-bold opacity-90 italic">Ready to archive</p>
              </div>
              <button onClick={(e) => handleDelete(e, 0)} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-500 transition-all active:scale-90 flex items-center justify-center">✕</button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
            <span className="text-6xl mb-6 opacity-10">🐕</span>
            <h5 className="text-[18px] font-black text-stone-300 tracking-tight mb-2">No Attachment.</h5>
            <p className="text-[13px] text-stone-400 font-medium leading-relaxed opacity-60">
              이미지나 문서를 <br /> 등록해주세요.
            </p>
          </div>
        )}

        <div className={`absolute inset-0 bg-stone-900/40 flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>

        {!file && !loading && (
          <button onClick={handleButtonClick} className="absolute inset-0 w-full h-full cursor-pointer z-10" title="파일 업로드" />
        )}
        
        {file && !loading && (
          <button onClick={handleButtonClick} className="absolute top-6 right-6 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-xl hover:scale-110 active:scale-90 transition-all">📷</button>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
      </div>
    );
  }

  if (variant === 'profile') {
    const file = effectiveFiles[0];
    return (
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-44 h-44 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-[#F9F7F5] flex items-center justify-center relative">
            {file ? (
              isImageFile(file.url, file.name) ? <img src={file.url} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-5xl">{getFileIcon(getFileExtension(file.url, file.name))}</span>
            ) : <span className="text-5xl opacity-10">🐶</span>}
            {loading && <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
          </div>
          <button onClick={handleButtonClick} disabled={loading} className="absolute -bottom-2 -right-2 bg-[#FF6B00] text-white w-11 h-11 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">📷</button>
        </div>
        {file && <button onClick={(e) => handleDelete(e, 0)} className="mt-4 text-[12px] font-black text-stone-300 hover:text-red-500 transition-colors">✕ 삭제</button>}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {effectiveFiles.map((file, idx) => renderFileItem(file, idx))}
      {(maxCount > effectiveFiles.length) && (
        <button 
          onClick={handleButtonClick} 
          disabled={loading}
          className="aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center text-stone-300 hover:border-[#FF6B00] hover:bg-orange-50/30 transition-all gap-1 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
          <span className="text-[10px] font-bold">파일 추가</span>
        </button>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" multiple={mode === 'multiple'} />
    </div>
  );
};
