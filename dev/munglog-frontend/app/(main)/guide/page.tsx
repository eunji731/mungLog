'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Users,
  MapPin,
  Stethoscope,
  ClipboardList,
  Package,
  Settings,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="max-w-7xl mx-auto w-full p-6 lg:p-10 space-y-8 text-text-main">
      {/* 타이틀 헤더 */}
      <div className="mb-2">
        <span className="text-xs font-black text-main-green tracking-widest uppercase mb-1 block">MungLog Menu Guide</span>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight">서비스 메뉴 가이드</h1>
        <p className="text-sm text-text-sub mt-1">MungLog의 모든 메뉴와 핵심 기능들을 알기 쉽게 설명해 드립니다.</p>
      </div>

      {/* 가이드 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. 대시보드 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Dashboard</span>
                <h2 className="font-black text-[16px] text-text-main">대시보드</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              반려동물의 최근 상태와 급여 일정, 건강 위험 요소들을 종합하여 한눈에 모아 보여주는 홈 화면입니다. 하루 산책 지수, 예방접종 D-Day 요약, 현재 관찰 중인 이상 증상(스냅) 정보, 그리고 사료나 약 등의 인벤토리 소진 예정 알림을 직관적으로 확인할 수 있습니다.
            </p>
          </div>
          <div>
            <Link
              href="/"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              대시보드 바로가기
            </Link>
          </div>
        </section>

        {/* 2. 캘린더 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Calendar</span>
                <h2 className="font-black text-[16px] text-text-main">캘린더</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              아이들의 사진들과 직접 작성한 태그로 아이들의 일기를 작성하고, 등록된 일정과 케어기록에 대한 세부 내역을 날짜별로 함께 확인하고 관리할 수 있는 타임라인 캘린더입니다.
            </p>
          </div>
          <div>
            <Link
              href="/calendar"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              캘린더 바로가기
            </Link>
          </div>
        </section>

        {/* 3. 아카이브 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Archive</span>
                <h2 className="font-black text-[16px] text-text-main">아카이브</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              아이들의 사진들로 AI 일기를 작성하며 첨부했던 모든 사진들이 자동으로 아카이브에 분류되어 안전하게 보관되는 앨범입니다. 아이들과의 소중한 기록 속 사진들을 편리하게 모아볼 수 있습니다.
            </p>
          </div>
          <div>
            <Link
              href="/archive"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              아카이브 바로가기
            </Link>
          </div>
        </section>

        {/* 4. 가족 관리 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Family Management</span>
                <h2 className="font-black text-[16px] text-text-main">가족 관리</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              소중한 아이들의 기본 프로필과 동물등록증 정보를 등록하고 확인하는 곳입니다. 핵심 예방접종별로 최근 접종일과 D-Day 상세 리스트를 한눈에 파악할 수 있으며, 새로운 예방접종 종류와 접종 주기(일 단위)를 직접 생성하고 편집하여 관리할 수 있습니다.
            </p>
          </div>
          <div>
            <Link
              href="/family"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              가족 관리 바로가기
            </Link>
          </div>
        </section>

        {/* 5. 지도 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Map</span>
                <h2 className="font-black text-[16px] text-text-main">지도</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              AI로 일기를 작성할 때 사용한 사진들의 GPS 위치 정보를 기반으로, 해당 위치에 반려동물과의 소중한 기억을 지도 위에서 시각적으로 확인하고 함께 추억할 수 있는 따뜻한 맵 공간입니다.
            </p>
          </div>
          <div>
            <Link
              href="/map"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              지도 바로가기
            </Link>
          </div>
        </section>

        {/* 6. 케어기록 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Care Records</span>
                <h2 className="font-black text-[16px] text-text-main">케어기록</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              진료비 지출, 미용, 예방접종 등 **실제로 완료한 일**을 기록하는 곳입니다.
              <br />
              <span className="font-extrabold text-main-green">💡 증상 스냅보드 연동:</span> 반려동물에게 구토나 설사 등 이상 증상이 관찰되었을 때 빠르게 사진과 적어둔 '증상 스냅'이 있다면, 케어기록을 쓸 때 연동하세요. 기록 작성을 마치면 해당 스냅이 자동으로 '해결됨(RESOLVED)' 상태로 갱신됩니다.
            </p>
          </div>
          <div className="flex gap-2.5 pt-1">
            <Link
              href="/care-records"
              className="flex-1 py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              기록 목록 바로가기
            </Link>
            <Link
              href="/care-records/new"
              className="flex-1 py-2.5 rounded-xl bg-main-green text-white text-center text-xs font-bold hover:bg-main-green/90 transition-all shadow-sm shadow-main-green/10"
            >
              새 기록 작성
            </Link>
          </div>
        </section>

        {/* 7. 일정/예약 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Schedules & Reservations</span>
                <h2 className="font-black text-[16px] text-text-main">일정/예약</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              미래에 있을 접종, 미용, 검진 등의 **계획(예약)**을 등록해 두는 곳입니다. 일정 생성 시 복용 아이템(사료, 구충약 등) 재고를 연동할 수 있습니다.
              <br />
              <span className="font-extrabold text-main-green">💡 케어기록으로 전환:</span> 예약한 날짜가 다가와 실제로 병원에 다녀오셨다면, 일정 상세 페이지에서 <span className="underline font-bold">케어기록으로 전환</span>을 누르세요. 완료 처리와 함께 실제 접종 내역 및 비용을 적는 '케어기록 작성' 폼으로 빠르게 이동합니다.
            </p>
          </div>
          <div className="flex gap-2.5 pt-1">
            <Link
              href="/schedules"
              className="flex-1 py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              일정 목록 바로가기
            </Link>
            <Link
              href="/schedules/new"
              className="flex-1 py-2.5 rounded-xl bg-main-green text-white text-center text-xs font-bold hover:bg-main-green/90 transition-all shadow-sm shadow-main-green/10"
            >
              새 일정 예약
            </Link>
          </div>
        </section>

        {/* 8. 인벤토리 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Inventory</span>
                <h2 className="font-black text-[16px] text-text-main">인벤토리</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              심장사상충 구충제, 사료, 영양제, 안약처럼 반복적으로 소비되는 물품의 남은 재고 개수를 추적해 줍니다. 
              여기 물품을 등록한 뒤 '일정/예약' 생성 시 연동해 두면, 일정을 완료 처리할 때마다 재고 수량이 자동으로 1개씩 깎이게 됩니다. 소진 예상 시기를 AI가 진단해 대시보드 경고 카드로 알립니다.
            </p>
          </div>
          <div>
            <Link
              href="/inventory"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              인벤토리 바로가기
            </Link>
          </div>
        </section>

        {/* 9. 설정 */}
        <section className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-main-green/10 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-main-green" />
              </div>
              <div>
                <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Settings</span>
                <h2 className="font-black text-[16px] text-text-main">설정</h2>
              </div>
            </div>
            <p className="text-[12.5px] font-bold text-text-sub leading-relaxed">
              화면 테마(라이트/다크/시스템) 관리 및 회원 탈퇴를 수행할 수 있습니다. 
              또한 AI 리포트 조언을 생성할 때 주거 환경(예: 4층 빌라 거주), 주 보호자와의 호칭 관계 등 AI가 상시 기억해야 할 핵심 맥락을 직접 지정할 수 있는 <span className="text-main-green font-black">AI 개인 컨텍스트</span> 설정 입력을 지원합니다.
            </p>
          </div>
          <div>
            <Link
              href="/settings"
              className="block w-full py-2.5 rounded-xl border border-border bg-background text-text-sub hover:border-main-green hover:text-main-green text-center text-xs font-bold transition-all"
            >
              설정 바로가기
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
