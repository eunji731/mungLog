'use client';

import { ScrollText } from 'lucide-react';

export default function LogsAdminPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-main-green/10 flex items-center justify-center shrink-0">
          <ScrollText className="w-5 h-5 text-main-green" />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-main tracking-tight">로그 관리</h1>
          <p className="text-xs text-text-sub mt-0.5">시스템 로그 조회 기능입니다.</p>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-dashed border-border p-16 text-center">
        <ScrollText className="w-10 h-10 text-border mx-auto mb-3" />
        <p className="text-sm font-black text-text-sub">준비 중인 기능입니다.</p>
        <p className="text-xs text-text-sub/70 mt-1">곧 추가될 예정입니다.</p>
      </div>
    </div>
  );
}
