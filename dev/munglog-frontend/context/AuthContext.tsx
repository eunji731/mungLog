import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth';
import type { User } from '@/api/auth';
import { apiClient } from '@/lib/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// 인증 정보를 담을 “상자” 
// 처음엔 값이 없어서 undefined -> 나중에 useAuth()를 AuthProvider 밖에서 잘못 썼을 때 에러를 강제로 띄우기 위해서
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 이 컴포넌트가 앱을 감싸면서 하위 컴포넌트들에게 인증 정보를 공급
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // 로그인한 유저 정보
  const [user, setUser] = useState<User | null>(null);
  // 로그인 상태 확인 중인지 여부
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 상태 확인 함수
  // 왜 useCallback 사용?
  // -> checkAuth를 그냥 함수로 만들면 렌더링 때마다 새로 생성
  // -> 아래 useEffect의 의존성 배열에서 계속 바뀐 걸로 인식 -> 그래서 고정하기 위해 useCallback 사용
  const checkAuth = useCallback(async () => {
    try {
      // 1. 로딩 시작
      setIsLoading(true);
      // 2. 백엔드에서 유저 정보 가져오기
      const userData = await authApi.getMe();
      // 3. 유저 정보 저장
      setUser(userData);
    } catch (error) {
      // 4. 에러 발생 시 유저 정보 없음 -> 로그인 안 된걸로 처리
      setUser(null);
    } finally {
      // 5. 로딩 종료
      setIsLoading(false);
    }
  }, []);

  // 로그인 함수
  // -> 로그인 성공 = 서버 쿠키 저장
  // -> checkAuth 성공 = 프론트 상태 갱신
  const login = async (credentials: any) => {
    // 아이디/비밀번호로 로그인 요청
    await authApi.login(credentials);
    // 로그인 직후 백엔드에서 갱신된 CSRF 토큰을 안전하게 가져오기 위해 호출
    await authApi.refreshCsrfToken();

    // 로그인 성공 후 유저 정보 갱신
    // 왜 checkAuth()를 또??
    // -> 로그인 API가 성공해도 프론트 상태의 user는 자동으로 바뀌지 않음
    // -> checkAuth()를 호출해서 백엔드에서 실제 로그인된 유저 정보를 가져와야 함
    await checkAuth();
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청
      await authApi.logout();
    } finally {
      // 성공하든 실패하든 프론트에서는 일단 로그아웃 상태로 바꿈
      setUser(null);
    }
  };

  useEffect(() => {
    // 앱 시작 시 로그인 상태 확인(앱이 처음 켜지면 브라우저에 남아 있는 쿠키 기준으로 로그인 상태를 확인)
    checkAuth();

    // Axios 인터셉터 등록: 401 에러 시 로컬 상태 초기화(401 Unauthorized가 오면 자동으로 user를 null로)
    const interceptor = apiClient.interceptors.response.use( // apiClient가 받는 모든 응답에 대해 이 규칙을 적용
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // user를 boolean으로 바꾼 값 (user 있으면 true / null이면 false)
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 전체 흐름 요약
// 1. 앱 시작
// 1-1. AuthProvider 실행
// 1-2. useEffect 실행
// 1-3. checkAuth() 호출
// 1-4. authApi.getMe() 요청
// 1-5. 성공하면 user 저장 / 실패하면 null
// 2. 로그인
// 2-1. login(credentials) 호출
// 2-2. authApi.login() 실행
// 2-3. refreshCsrfToken() 실행
// 2-4. checkAuth() 실행
// 2-5. user 상태 갱신
// 2-6. isAuthenticated가 true가 됨
// 3. 로그아웃
// 3-1. logout() 호출
// 3-2. authApi.logout() 실행
// 3-3. 최종적으로 setUser(null)
// 4. 인증 만료
// 4-1. 다른 API 호출
// 4-2. 서버가 401 응답
// 4-3. 인터셉터가 감지
// 4-4. setUser(null)
