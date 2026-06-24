import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // 로딩 중일 때 표시할 화면 (Spinner 등)
    return <div>로그인 확인 중...</div>;
  }

  if (!isAuthenticated) {
    // 로그인되지 않았으면 로그인 페이지로 이동, 현재 위치 기억
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
