'use client';

import { Users } from 'lucide-react';

export default function UsersAdminPage() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 py-6 px-4 animate-in fade-in duration-300">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-surface-green to-transparent p-6 rounded-2xl border border-border/50">
        <div className="w-12 h-12 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0 border border-main-green/20">
          <Users className="w-6 h-6 text-main-green" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight">유저 관리</h1>
          <p className="text-xs text-text-sub mt-1 leading-relaxed">회원 조회 및 상세 관리를 지원하는 기능입니다.</p>
        </div>
      </div>

      {/* 준비 중 카드 */}
      <div className="bg-background rounded-3xl border border-dashed border-border/80 p-20 text-center shadow-sm hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-surface-green rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
          <Users className="w-8 h-8 text-text-sub/40" />
        </div>
        <h2 className="text-base font-black text-text-main">준비 중인 기능입니다</h2>
        <p className="text-xs text-text-sub/70 mt-2 font-medium">관리자 유저 제어 및 등급 조율 기능이 곧 추가될 예정입니다.</p>
      </div>
    </div>
  );
}
