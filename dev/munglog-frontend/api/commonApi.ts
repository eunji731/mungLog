import { apiClient } from '@/lib/apiClient';

export interface CodeItem {
  id: number; // DB의 PK ID
  code: string; // 'MEDICAL', 'FEED' 등의 코드 문자열
  codeName: string; // '병원기록', '사료/간식' 등의 표시 명칭
  sortOrder: number;
}

export const commonApi = {
  // 특정 그룹의 코드 목록 조회
  getCodes: async (groupCode: string): Promise<CodeItem[]> => {
    const response = await apiClient.get(`/codes/${groupCode}`);
    // apiClient 인터셉터에서 이미 response.data.data를 반환함
    // 백엔드 snake_case → 프론트 camelCase 매핑
    const rawData = response.data || [];
    return rawData.map((item: any) => ({
      id: item.id,
      code: item.code,
      codeName: item.codeName || item.code_name,
      sortOrder: item.sortOrder ?? item.sort_order,
    }));
  }
};
