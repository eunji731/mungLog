export interface FileItem {
  id: string | number;
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  targetType: string;
  targetId: string | number | null;
  createdAt: string;
}

export interface FileUploadParams {
  targetType: string;
  targetId?: string | number | null;
  files: File[];
}
