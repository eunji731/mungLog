import { useState, useEffect, useCallback } from 'react';
import { fileApi } from '@/api/fileApi';
import { useCommonCodes } from './useCommonCodes';
import type { FileItem } from '@/types/file';

/**
 * 파일 선택/미리보기/업로드를 담당하는 공통 훅
 * 
 * 업로드 플로우:
 * 1. POST /api/files/upload  → 파일 물리 저장 + fileId 반환
 * 2. 각 도메인 저장 API에서 fileId 목록을 함께 전송 → FileMapping 생성
 */
export const useFileUpload = (targetCode?: string) => {
  const { codes: targetTypeCodes } = useCommonCodes('FILE_TARGET_TYPE');
  const [existingFiles, setExistingFiles] = useState<FileItem[]>([]);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);


  const revokeAllPreviews = useCallback(() => {
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, [previewUrls]);

  // 컴포넌트 언마운트 시 blob URL 해제
  useEffect(() => {
    return () => revokeAllPreviews();
  }, [revokeAllPreviews]);

  const setInitialFiles = useCallback((files: FileItem[]) => {
    setExistingFiles(files || []);
  }, []);

  const handleSelect = (files: File[], maxCount: number = 1) => {
    if (files.length === 0) return;
    if (maxCount === 1) {
      revokeAllPreviews();
      setLocalFiles([files[0]]);
      setPreviewUrls([URL.createObjectURL(files[0])]);
      setExistingFiles([]);
    } else {
      const remaining = maxCount - existingFiles.length - localFiles.length;
      const newFiles = files.slice(0, Math.max(0, remaining));
      if (newFiles.length === 0) return;
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setLocalFiles(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const handleDelete = (index: number) => {
    const totalExisting = existingFiles.length;
    if (index < totalExisting) {
      setExistingFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      const localIdx = index - totalExisting;
      const urlToRevoke = previewUrls[localIdx];
      if (urlToRevoke?.startsWith('blob:')) URL.revokeObjectURL(urlToRevoke);
      setLocalFiles(prev => prev.filter((_, i) => i !== localIdx));
      setPreviewUrls(prev => [...previewUrls.slice(0, localIdx), ...previewUrls.slice(localIdx + 1)]);
    }
  };

  /**
   * 선택된 파일을 서버에 임시 업로드합니다.
   * 반환된 FileItem[]의 id 목록을 도메인 저장 API에 fileIds로 전달하세요.
   */
  const upload = async (targetId: string | number | null = null): Promise<FileItem[] | null> => {
    if (localFiles.length === 0) return null;

    try {
      setIsUploading(true);
      
      // targetCode에 해당하는 targetTypeId 찾기
      const found = targetTypeCodes.find(t => t.code === targetCode);
      const targetType = found ? found.id : (targetCode || '');

      const result = await fileApi.uploadFiles({ 
        targetType,
        targetId,
        files: localFiles 
      });
      return result;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    fileInfos: [
      ...existingFiles.map(f => ({ url: f.fileUrl, name: f.originalFileName, isExisting: true })),
      ...localFiles.map((f, i) => ({ url: previewUrls[i], name: f.name, isExisting: false }))
    ],
    localFiles,
    existingFiles,
    existingFileIds: existingFiles.map(f => f.id),
    isUploading,
    isReady: true, // 별도 준비 단계 불필요
    hasNewFiles: localFiles.length > 0,
    setInitialFiles,
    handleSelect,
    handleDelete,
    upload,
    clear: () => { revokeAllPreviews(); setLocalFiles([]); setPreviewUrls([]); setExistingFiles([]); }
  };
};
