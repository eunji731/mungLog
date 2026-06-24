import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Spring Boot 백엔드 API (AuthContext 경유) 호출
      await login({ email, password });

      showToast('로그인에 성공했습니다!', 'success');
      navigate('/'); // 홈 화면으로 이동

    } catch (err: any) {
      console.error('로그인 에러:', err);
      // 백엔드에서 내려주는 상세 에러 메시지가 있다면 표시
      const message = err.response?.data?.message || '로그인을 실패했습니다. 이메일이나 비밀번호를 확인해주세요.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  };
};
