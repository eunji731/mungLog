import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 에러:', error);
    } finally {
      navigate('/login');
    }
  };

  const menuItems = [
    { label: '홈', path: '/' },
    { label: '반려견', path: '/dogs' },
    { label: '케어기록', path: '/care-records' },
    { label: '일정/예약', path: '/schedules' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-[#FCFAF8]/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-[100]">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 h-[80px] grid grid-cols-2 md:grid-cols-3 items-center">
        
        {/* LEFT: LOGO AREA */}
        <div className="flex items-center justify-start">
          <Link 
            to="/" 
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B00]/10 group-hover:rotate-6 transition-transform">
              <span className="text-lg">🐾</span>
            </div>
            <span className="text-[18px] font-black text-[#2D2D2D] tracking-tight uppercase">
              PawCare<span className="text-[#FF6B00]">.</span>
            </span>
          </Link>
        </div>

        {/* CENTER: MAIN NAVIGATION (Truly Centered) */}
        <nav className="hidden md:flex items-center justify-self-center gap-12">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative text-[14px] font-bold tracking-tight transition-all duration-300 py-1.5 ${
                isActive(item.path)
                  ? 'text-[#FF6B00]'
                  : 'text-stone-400 hover:text-[#2D2D2D]'
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#FF6B00] rounded-full animate-in fade-in zoom-in-95 duration-500" />
              )}
            </Link>
          ))}
        </nav>

        {/* RIGHT: USER AREA */}
        <div className="flex items-center justify-end">
          {/* Desktop User Info */}
          <div className="hidden md:flex items-center gap-5">
            <div className="flex flex-col items-end pr-5 border-r border-stone-100">
              <span className="text-[12px] font-black text-[#2D2D2D] leading-none mb-1">
                {user?.name || '사용자'}님
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold text-stone-300 hover:text-red-400 transition-colors cursor-pointer tracking-widest uppercase"
              >
                Logout
              </button>
            </div>
            <Link 
              to="/mypage" 
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                isActive('/mypage')
                  ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]'
                  : 'border-stone-100 bg-white text-stone-400 hover:border-stone-200'
              }`}
            >
              <span className="text-base">👤</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-3">
            <Link 
              to="/mypage"
              className="w-9 h-9 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-base"
            >
              👤
            </Link>
            <button
              className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-[#2D2D2D]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN (기존 로직 유지) */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-stone-50 bg-white/98 backdrop-blur-xl px-6 py-8 space-y-6 shadow-2xl absolute w-full left-0 z-40 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-[17px] font-black tracking-tight ${
                  isActive(item.path) ? 'text-[#FF6B00]' : 'text-stone-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[13px] font-bold text-stone-500 tracking-tight">{user?.name}님 환영해요!</span>
            <button
              onClick={handleLogout}
              className="text-[12px] font-black text-red-400 hover:text-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
