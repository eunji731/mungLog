import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface CodeItem {
  id: number;
  code: string;
  codeName: string;
  sortOrder: number;
}

/**
 * 공통 코드를 실시간으로 가져오는 훅
 */
export const useCommonCodes = (groupCode: string) => {
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!groupCode) return;

    const fetchCodes = async () => {
      try {
        setIsLoading(true);
        /**
         * 캐시 방지(Cache Busting): 
         * URL 뒤에 현재 시간을 붙여 브라우저나 중간 서버가 캐시된 응답을 주지 못하게 강제합니다.
         */
        const response = await apiClient.get(`/codes/${groupCode}`, {
          params: { _t: Date.now() }
        });

        const data = response.data || [];
        setCodes(data);
      } catch (err) {
        console.error(`Failed to fetch codes for ${groupCode}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodes();
  }, [groupCode]);

  /**
   * 코드값으로 ID를 찾는 함수
   * 서버가 문자열 코드가 아니라 id를 요구할 수 있기 때문
   * @param codeValue 
   * @returns 
   */
  const findIdByCode = (codeValue: string) => {
    return codes.find(c => c.code === codeValue)?.id;
  };

  /**
   * 코드값으로 사람이 읽을 이름을 찾는 함수
   * 못 찾으면 그냥 원래 코드값을 반환(예를 들어 매핑이 없으면 undefined 대신 ROLE_USER라도 보여주겠다는 뜻)
   * @param codeValue 
   * @returns 
   */
  const getCodeName = (codeValue: string) => {
    return codes.find(c => c.code === codeValue)?.codeName || codeValue;
  };

  /**
   * ID로 이름을 찾는 함수(ID가 없으면 그냥 빈 문자열 반환)
   * @param id 
   * @returns 
   */
  const getCodeNameById = (id?: number) => {
    if (!id) return '';
    return codes.find(c => c.id === id)?.codeName || '';
  };

  /**
   * ID로 코드값을 찾는 함수(ID가 없으면 그냥 빈 문자열 반환)
   * @param id 
   * @returns 
   */
  const getCodeById = (id?: number) => {
    if (!id) return '';
    return codes.find(c => c.id === id)?.code || '';
  };

  return {
    // 단순히 코드 배열만 주는 게 아니라 찾기 도구까지 같이 제공
    // ID ↔ code ↔ codeName 변환이 통일
    codes,
    isLoading,
    getCodeName,
    findIdByCode,
    getCodeNameById,
    getCodeById
  };
};
