import { useSignup } from '@/pages/Signup/hooks/useSignup';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export const SignupForm = () => {
  const { email, setEmail, password, setPassword, name, setName, error, loading, handleSignup } = useSignup();

  return (
    <form onSubmit={handleSignup} className="space-y-8">
      <div className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="성함을 입력하세요"
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 설정하세요 (6자 이상)"
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-100 animate-in fade-in zoom-in-95 duration-300">
          <p className="text-[13px] text-red-500 font-bold text-center leading-tight">
            {error}
          </p>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full h-[64px] text-[16px] shadow-xl shadow-[#FF6B00]/10"
          disabled={loading}
        >
          {loading ? '계정 생성 중...' : '아카이브 생성하기'}
        </Button>
      </div>
    </form>
  );
};
