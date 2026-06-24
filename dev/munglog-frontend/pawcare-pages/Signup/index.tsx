import { SignupForm } from '@/pages/Signup/components/SignupForm';

export const SignupPage = () => {
  return (
    <div className="min-h-screen bg-[#FCFAF8] flex flex-col items-center justify-center p-6 selection:bg-[#FF6B00]/10">
      {/* 1. BRAND HEADER */}
      <header className="mb-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-14 h-14 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#FF6B00]/20 mb-6">
          <span className="text-3xl">🐾</span>
        </div>
        <h1 className="text-[28px] font-black text-[#2D2D2D] tracking-tight mb-2 uppercase">
          PawCare<span className="text-[#FF6B00]">.</span>
        </h1>
        <p className="text-[15px] text-stone-400 font-medium tracking-tight word-break-keep-all px-4">
          새로운 가족의 건강 기록 아카이브를 지금 시작하세요.
        </p>
      </header>

      {/* 2. SIGNUP CARD */}
      <main className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="bg-white rounded-[32px] p-10 lg:p-14 border border-[#F0F0F0] shadow-[0_30px_80px_rgba(0,0,0,0.02)]">
          <SignupForm />
        </div>
        
        {/* FOOTER LINK */}
        <p className="mt-10 text-center text-[14px] font-bold text-stone-400">
          이미 계정이 있으신가요?{' '}
          <a 
            href="/login" 
            className="text-[#FF6B00] hover:underline underline-offset-4 ml-2 transition-all"
          >
            로그인하기
          </a>
        </p>
      </main>
    </div>
  );
};
