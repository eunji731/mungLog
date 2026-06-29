import { useState, useEffect, useCallback } from 'react';
import { fileApi } from '@/api/fileApi';
import type { FileItem } from '@/types/file';

/**
 * 파일 선택/미리보기/업로드를 담당하는 공통 훅
 *
 * 백엔드의 첨부파일 API는 부모(케어기록/일정/반려견)가 이미 생성되어 있어야
 * parentId로 파일을 붙일 수 있습니다. 그래서 업로드 플로우는:
 * 1. 화면에서는 로컬 File만 들고 있다가
 * 2. 부모 레코드를 먼저 생성/수정한 뒤
 * 3. syncToServer(parentId)로 실제 업로드를 진행합니다.
 */
export const useFileUpload = (targetCode: string) => {
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
      setPreviewUrls(prev => [...prev.slice(0, localIdx), ...prev.slice(localIdx + 1)]);
    }
  };

  /**
   * 부모(케어기록/일정/반려견) 레코드가 생성/수정된 뒤, parentId로 로컬에 쌓인 파일을 업로드합니다.
   */
  const syncToServer = async (parentId: string | number): Promise<FileItem[]> => {
    if (localFiles.length === 0) return [];

    try {
      setIsUploading(true);
      const uploaded = await fileApi.addFiles(targetCode, parentId, localFiles);
      revokeAllPreviews();
      setLocalFiles([]);
      setPreviewUrls([]);
      setExistingFiles(prev => [...prev, ...uploaded]);
      return uploaded;
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
    hasNewFiles: localFiles.length > 0,
    setInitialFiles,
    handleSelect,
    handleDelete,
    syncToServer,
    clear: () => { revokeAllPreviews(); setLocalFiles([]); setPreviewUrls([]); setExistingFiles([]); }
  };
};
