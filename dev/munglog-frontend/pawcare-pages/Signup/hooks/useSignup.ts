import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useCommonCodes } from '@/hooks/useCommonCodes';
import { useToast } from '@/context/ToastContext';

export const useSignup = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // DB에서 사용자 역할(ROLE) 코드 목록 가져오기
  const { codes: roles } = useCommonCodes('USER_ROLE');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('이메일, 비밀번호, 보호자 이름을 모두 입력해주세요.');
      return;
    }

    // ROLE_USER에 해당하는 ID 찾기
    const userRole = roles.find(r => r.code === 'ROLE_USER');
    
    // 만약 코드를 아직 못 불러왔다면 잠시 대기 안내 (네트워크 지연 대비)
    if (!userRole) {
      setError('설정 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Spring Boot 회원가입 API 연동
      // role_id 필드에 DB에서 찾은 ID값 전송
      await apiClient.post('/auth/signup', {
        email,
        password,
        name,
        roleId: userRole.id
      });

      showToast('멍케어차트 가입을 환영합니다! 🎉 (로그인 창으로 넘어갑니다.)', 'success');
      window.location.href = '/login';
      } catch (err: unknown) {      console.error('회원가입 에러:', err);
      // axios 에러 등에서 response.data.message 추출
      const errorResponse = (err as { response?: { data?: { message?: string } } })?.response;
      const errorMessage = errorResponse?.data?.message || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    name, setName,
    error, loading,
    handleSignup
  };
};
