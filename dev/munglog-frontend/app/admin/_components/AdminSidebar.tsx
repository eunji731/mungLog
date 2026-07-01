'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Stethoscope,
  Users,
  ScrollText,
  ChevronRight,
  LogOut,
  X,
  Menu,
  Syringe,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/app/common/hooks/useToast';
import { useConfirm } from '@/app/common/hooks/useConfirm';

const navItems = [
  {
    label: '증상 관리',
    href: '/admin/symptoms',
    icon: Stethoscope,
    description: '증상마스터 태그 관리',
  },
  {
    label: '예방접종 관리',
    href: '/admin/vaccinations',
    icon: Syringe,
    description: '기본 접종 종류 관리',
  },
  {
    label: '유저 관리',
    href: '/admin/users',
    icon: Users,
    description: '회원 조회 및 관리',
    disabled: true,
  },
  {
    label: '로그 관리',
    href: '/admin/logs',
    icon: ScrollText,
    description: '시스템 로그 조회',
    disabled: true,
  },
];

interface SidebarContentProps {
  onClose: () => void;
}

function SidebarContent({ onClose }: SidebarContentProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { logout } = useAuth();
  const { success } = useToast();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm('로그아웃 하시겠습니까?');
    if (!ok) return;
    let kakaoLogoutUrl: string | undefined;
    try {
      kakaoLogoutUrl = await logout();
    } catch {}
    if (kakaoLogoutUrl) {
      window.location.href = kakaoLogoutUrl;
      return;
    }
    success('안전하게 로그아웃되었습니다.');
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-bg">
      {/* 헤더 */}
      <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-main-green flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-black text-text-main tracking-tight leading-none">관리자</div>
            <div className="text-[10px] text-text-sub font-bold mt-0.5">Admin Console</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-text-sub hover:bg-border/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 앱으로 돌아가기 */}
      <div className="px-4 py-3 border-b border-border/50 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-text-sub hover:text-main-green font-bold transition-colors group"
        >
          <div className="relative w-5 h-5 shrink-0">
            <Image src="/logo_simple.png" alt="MungLog" fill sizes="20px" className="object-contain" />
          </div>
          <span>MungLog 앱으로 돌아가기</span>
          <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-black text-text-sub/50 uppercase tracking-widest px-3 mb-2">메뉴</div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {item.disabled ? (
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl opacity-40 cursor-not-allowed">
                  <Icon className="w-4.5 h-4.5 text-text-sub shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-text-sub truncate">{item.label}</div>
                    <div className="text-[10px] text-text-sub/70 font-medium truncate">{item.description}</div>
                  </div>
                  <span className="text-[9px] font-black text-text-sub/50 bg-border/50 px-1.5 py-0.5 rounded-full shrink-0">준비중</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-main-green text-white shadow-md shadow-main-green/20'
                      : 'text-text-sub hover:bg-main-green/5 hover:text-main-green'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-main-green transition-colors'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-bold truncate ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                    <div className={`text-[10px] font-medium truncate ${isActive ? 'text-white/70' : 'text-text-sub/70'}`}>{item.description}</div>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* 푸터 */}
      <div className="p-3 border-t border-border/50 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-text-sub hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[13px] font-bold">로그아웃</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[110] w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm"
      >
        <Menu className="w-5 h-5 text-text-main" />
      </button>

      {/* 데스크탑 사이드바 */}
      <aside className="hidden lg:flex flex-col w-[220px] h-screen sticky top-0 border-r border-border shrink-0">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[260px] h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
