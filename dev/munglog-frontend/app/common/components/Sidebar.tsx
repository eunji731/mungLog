'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Image as ImageIcon,
  MapPin,
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  Package,
  Settings,
  ChevronDown,
  X,
  LogOut,
  Users,
  Plus,
  BookOpen
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import { usePet, ALL_PETS_ID } from '../hooks/usePet';
import { getImagePath } from '@/lib/clientApi';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '캘린더', href: '/calendar', icon: Calendar },
  { name: '아카이브', href: '/archive', icon: ImageIcon },
  { name: '가족 관리', href: '/family', icon: Users },
  { name: '지도', href: '/map', icon: MapPin },
  { name: '케어기록', href: '/care-records', icon: Stethoscope },
  { name: '일정/예약', href: '/schedules', icon: ClipboardList },
  { name: '인벤토리', href: '/inventory', icon: Package },
  { name: '설정', href: '/settings', icon: Settings },
  { name: '서비스 가이드', href: '/guide', icon: BookOpen },
];

interface SidebarContentProps {
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
}

const SidebarContent = ({ pathname, onClose, onLogout }: SidebarContentProps) => {
  const router = useRouter();
  const { pets, selectedPetId, setSelectedPetId } = usePet();
  const [isPetSwitcherOpen, setIsPetSwitcherOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const primaryPet = pets.find(p => p.id === selectedPetId);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isPetSwitcherOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsPetSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPetSwitcherOpen]);

  return (
    <div className="flex flex-col h-full bg-sidebar-bg">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-height: 740px) {
          .nav-container {
            padding-top: 0.35rem !important;
            padding-bottom: 0.35rem !important;
          }
          .nav-container > * + * {
            margin-top: 0.25rem !important;
          }
          .nav-item {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            gap: 0.65rem !important;
          }
          .footer-container {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .footer-container > * + * {
            margin-top: 0.4rem !important;
          }
          .switcher-btn {
            padding: 0.5rem !important;
          }
        }
      `}} />
      <div className="p-4.5 flex items-center justify-between border-b border-main-yellow/10 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={(e) => {
            e.preventDefault();
            if (pathname === '/') {
              window.location.href = '/';
            } else {
              router.push('/');
            }
            onClose();
          }}
        >
          <div className="relative w-9 h-9 shrink-0">
            <Image src="/logo_simple.png" alt="Logo" fill sizes="36px" className="object-contain" />
          </div>
          <span className="text-[19px] font-black tracking-tighter text-text-main leading-tight">
            Mung<span className="text-main-green">Log</span>
          </span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 text-text-main hover:bg-main-yellow/20 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="nav-container flex-1 px-4 py-4.5 space-y-1.5 shrink-0">
        {navItems.map((item) => {
          const isActive = (item.href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) || 
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const targetHref = item.href === '/dashboard' ? '/' : item.href;
          return (
            <Link
              key={item.name}
              href={targetHref}
              onClick={(e) => {
                e.preventDefault();
                if (pathname === targetHref) {
                  window.location.href = targetHref;
                } else {
                  router.push(targetHref);
                }
                onClose();
              }}
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-main-green text-white shadow-lg shadow-main-green/15 font-extrabold' 
                  : 'text-text-main/75 hover:bg-main-green/5 hover:text-main-green font-bold'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-main-green transition-colors'}`} />
              <span className={`text-[15px] tracking-tight ${isActive ? 'text-white' : 'group-hover:text-main-green'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="footer-container p-3 border-t border-main-yellow/10 space-y-2.5 relative shrink-0">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-sub hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-[14px] font-bold tracking-tight">로그아웃</span>
        </button>

        {/* 가족 스위처 영역 (Dropdown을 버튼 바로 위에 띄우기 위해 relative 래퍼로 감쌈) */}
        <div ref={dropdownRef} className="relative w-full">
          {/* Pet Switcher Dropdown */}
          {isPetSwitcherOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-background rounded-xl shadow-2xl border border-border overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
              <div className="p-3 border-b border-border bg-surface-green/30">
                <span className="text-[10px] font-black text-main-green uppercase tracking-widest">가족 선택</span>
              </div>
              <div className="max-h-52 overflow-y-auto scrollbar-thin pr-0.5">
                {/* All Pets Option */}
                <button
                  onClick={() => {
                    setSelectedPetId(ALL_PETS_ID);
                    setIsPetSwitcherOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-surface-green transition-all ${selectedPetId === ALL_PETS_ID ? 'bg-main-green/5' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-main-green flex items-center justify-center shrink-0 border border-background text-white">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-extrabold text-[13.5px] truncate ${selectedPetId === ALL_PETS_ID ? 'text-main-green' : 'text-text-main'}`}>모든 가족</div>
                    <div className="text-[10px] text-text-sub font-semibold truncate">전체 기록 보기</div>
                  </div>
                  {selectedPetId === ALL_PETS_ID && <div className="w-1.5 h-1.5 rounded-full bg-main-green" />}
                </button>

                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPetId(pet.id);
                      setIsPetSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-surface-green transition-all ${selectedPetId === pet.id ? 'bg-main-green/5' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-main-green/10 relative overflow-hidden shrink-0 border border-background">
                      <Image src={getImagePath(pet.photo, 'profiles')} alt={pet.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className={`font-extrabold text-[13.5px] truncate ${selectedPetId === pet.id ? 'text-main-green' : 'text-text-main'}`}>{pet.name}</div>
                      <div className="text-[10px] text-text-sub font-semibold truncate">{pet.breed}</div>
                    </div>
                    {selectedPetId === pet.id && <div className="w-1.5 h-1.5 rounded-full bg-main-green" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPetId === ALL_PETS_ID ? (
            <div 
              onClick={() => pets.length > 0 && setIsPetSwitcherOpen(!isPetSwitcherOpen)}
              className={`switcher-btn flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-main-yellow/5 hover:bg-background transition-all shadow-sm group cursor-pointer ${isPetSwitcherOpen ? 'ring-1.5 ring-main-green' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-main-green flex items-center justify-center shrink-0 ring-1.5 ring-background shadow-sm text-white">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-[14.5px] text-text-main truncate group-hover:text-main-green transition-colors">모든 가족</div>
                <div className="text-[11px] text-text-sub font-bold truncate">가족 전체 관리 중</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-sub group-hover:text-main-green transition-all ${isPetSwitcherOpen ? 'rotate-180' : ''}`} />
            </div>
          ) : primaryPet ? (
            <div 
              onClick={() => pets.length > 0 && setIsPetSwitcherOpen(!isPetSwitcherOpen)}
              className={`switcher-btn flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-main-yellow/5 hover:bg-background transition-all shadow-sm group cursor-pointer ${isPetSwitcherOpen ? 'ring-1.5 ring-main-green' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-main-green/20 relative overflow-hidden ring-1.5 ring-background shadow-sm shrink-0">
                <Image src={getImagePath(primaryPet.photo, 'profiles')} alt={primaryPet.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-[14.5px] text-text-main truncate group-hover:text-main-green transition-colors">{primaryPet.name}</div>
                <div className="text-[11px] text-text-sub font-bold truncate">{primaryPet.breed}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-sub group-hover:text-main-green transition-all ${isPetSwitcherOpen ? 'rotate-180' : ''}`} />
            </div>
          ) : (
            <Link 
              href="/family"
              onClick={(e) => {
                e.preventDefault();
                if (pathname === '/family') {
                  window.location.href = '/family';
                } else {
                  router.push('/family');
                }
                onClose();
              }}
              className="switcher-btn flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-dashed border-main-yellow/30 hover:bg-background transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-light-yellow flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-main-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-[14.5px] text-text-sub truncate">아이 등록하기</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { success } = useToast();
  const { confirm } = useConfirm();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const isConfirmed = await confirm('로그아웃 하시겠습니까?');
    if (!isConfirmed) return;

    let kakaoLogoutUrl: string | undefined;
    try {
      kakaoLogoutUrl = await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }

    if (kakaoLogoutUrl) {
      window.location.href = kakaoLogoutUrl;
      return;
    }

    success('안전하게 로그아웃되었습니다.');
    router.push('/login');
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-[250px] h-screen sticky top-0 border-r border-border shrink-0">
        <SidebarContent 
          pathname={pathname} 
          onClose={onClose} 
          onLogout={handleLogout} 
        />
      </aside>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
          <aside className="relative w-[85%] max-w-[320px] h-full shadow-2xl animate-in slide-in-from-left duration-500">
            <SidebarContent 
              pathname={pathname} 
              onClose={onClose} 
              onLogout={handleLogout} 
            />
          </aside>
        </div>
      )}
    </>
  );
}
