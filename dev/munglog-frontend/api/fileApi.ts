import { apiClient } from '@/lib/apiClient';
import type { FileItem } from '@/types/file';

// 프런트의 'CARE_RECORD'/'SCHEDULE'/'DOG' 키 -> 백엔드 ParentDomainType 문자열
const PARENT_TYPE_MAP: Record<string, string> = {
  CARE_RECORD: 'CARE',
  CARE: 'CARE',
  SCHEDULE: 'SCHEDULE',
  DOG: 'PET_PROFILE',
  PET_DOC: 'PET_DOC',
};

export const toParentType = (targetCode: string) => PARENT_TYPE_MAP[targetCode] || targetCode;

interface BackendFileResponse {
  id: string;
  originalName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  sortOrder: number;
  createdAt: string;
}

const toFileItem = (f: BackendFileResponse, parentType: string, parentId: string | number): FileItem => ({
  id: f.id,
  originalFileName: f.originalName,
  storedFileName: f.originalName,
  fileUrl: f.fileUrl,
  fileSize: f.fileSize,
  fileType: f.contentType,
  targetType: parentType,
  targetId: parentId,
  createdAt: f.createdAt,
});

export const fileApi = {
  // 부모 도메인(케어기록/일정/반려견)에 이미 첨부된 파일 목록 조회
  getFiles: async (targetCode: string, parentId: string | number): Promise<FileItem[]> => {
    const parentType = toParentType(targetCode);
    const response = await apiClient.get(`/files/${parentType}/${parentId}`);
    const files: BackendFileResponse[] = response.data || [];
    return files.map(f => toFileItem(f, targetCode, parentId));
  },

  // 부모 엔티티가 이미 생성된 상태에서 새 파일을 추가 (기존 파일 유지)
  addFiles: async (targetCode: string, parentId: string | number, files: File[]): Promise<FileItem[]> => {
    if (files.length === 0) return [];
    const parentType = toParentType(targetCode);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await apiClient.post(`/files/${parentType}/${parentId}/sync`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const result: BackendFileResponse[] = response.data || [];
    return result.map(f => toFileItem(f, targetCode, parentId));
  },

  // 단일 파일 교체 (반려견 프로필 사진 등 1장만 유지되는 경우)
  replaceSingle: async (targetCode: string, parentId: string | number, file: File): Promise<FileItem | null> => {
    const parentType = toParentType(targetCode);
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.put(`/files/${parentType}/${parentId}/replace`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data ? toFileItem(response.data, targetCode, parentId) : null;
  },

  // 특정 파일 삭제 (백엔드 PUT sync에 deletedFileIds 전달)
  deleteFiles: async (targetCode: string, parentId: string | number, fileIds: (string | number)[]): Promise<FileItem[]> => {
    if (fileIds.length === 0) return [];
    const parentType = toParentType(targetCode);
    const response = await apiClient.put(
      `/files/${parentType}/${parentId}/sync`,
      { deletedFileIds: fileIds }
    );
    const result: BackendFileResponse[] = response.data || [];
    return result.map(f => toFileItem(f, targetCode, parentId));
  },
};
