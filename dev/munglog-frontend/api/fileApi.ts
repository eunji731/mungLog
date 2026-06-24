import { apiClient } from '@/lib/apiClient';
import type { FileItem } from '@/types/file';

export const fileApi = {
  // 파일 업로드 (임시 업로드)
  uploadFiles: async (payload: {
    targetType: string | number;
    targetId: string | number | null;
    files: File[];
  }): Promise<FileItem[]> => {
    const formData = new FormData();
    // 백엔드 uploadTemporary DTO에 맞춰 구성
    payload.files.forEach((file) => {
      formData.append('files', file);
    });

    if (payload.targetType) {
      formData.append('targetType', String(payload.targetType));
    }
    if (payload.targetId !== null && payload.targetId !== undefined) {
      formData.append('targetId', String(payload.targetId));
    }

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 파일 목록 조회 (쿼리 파라미터 방식으로 확실히 지정)
  // 결과 URL 예시: /api/files?targetTypeId=19&targetId=30
  getFiles: async (targetTypeId: string | number, targetId: string | number): Promise<FileItem[]> => {
    console.log(`[fileApi] getFiles called with targetTypeId: ${targetTypeId}, targetId: ${targetId}`);
    const response = await apiClient.get('/files', {
      params: { 
        targetTypeId: targetTypeId, 
        targetId: targetId 
      }
    });
    return response.data;
  },

  // 파일 삭제
  deleteFile: async (fileId: number) => {
    await apiClient.delete(`/files/${fileId}`);
  }
};
