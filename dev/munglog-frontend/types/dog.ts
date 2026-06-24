/**
 * 백엔드 공통 응답 구조
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

/**
 * 반려견 정보 (응답용)
 */
export interface Dog {
  id: string;
  userId?: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  adoptionDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN' | string | null;
  weight: number | null;
  weightKg?: number | null;
  profileImageUrl: string | null;
  traits?: string | null;
  appearance?: string | null;
  likes?: string | null;
  dislikes?: string | null;
  diaryTone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 반려견 생성 요청 DTO
 */
export interface DogCreateRequest {
  name: string;
  breed: string | null;
  birthDate: string | null; // YYYY-MM-DD
  adoptionDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN' | string | null;
  weight: number | null;
  weightKg?: number | null;
  profileImageUrl: string | null;
  profileImageFileId?: string | number | null; // 추가: 파일 매핑을 위한 ID
  traits?: string | null;
  appearance?: string | null;
  likes?: string | null;
  dislikes?: string | null;
  diaryTone?: string | null;
}

/**
 * 반려견 수정 요청 DTO
 */
export type DogUpdateRequest = Partial<DogCreateRequest>;
