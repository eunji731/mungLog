import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // 현재 떠 있는 토스트 목록을 저장하는 배열
  const [toasts, setToasts] = useState<Toast[]>([]);

  // useCallback으로 함수를 기억해서 재사용
  // -> showToast 함수를 불필요하게 매번 새로 만들지 않게 하려는 목적
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    // 기존 배열 뒤에 새 토스트를 붙임
    setToasts((prev) => [...prev, { id, message, type }]);
    // 3초 뒤에 해당 토스트를 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // 수동 삭제 함수
  // -> 사용자가 토스트를 클릭했을 때 바로 지우는 함수
  // 자동으로는 3초 뒤 사라지고, 직접 클릭하면 즉시 사라짐
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    // ToastContext.Provider로 감싸서 자식 컴포넌트들이 showToast를 사용할 수 있게 함
    <ToastContext.Provider value={{ showToast }}>
      {/* 자식 컴포넌트들(원래화면)을 감싸줌 */}
      {children}
      {/* 토스트 목록을 화면에 띄워주는 부분 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md px-6 pointer-events-none">
        {/* 현재 배열에 들어 있는 토스트들을 하나씩 화면에 그려줌 
        - toasts 배열이 바뀔 때마다 이 부분이 다시 실행됨
        - toasts 배열에 토스트가 없으면 아무것도 안 보임
        - toasts 배열에 토스트가 있으면 하나씩 화면에 그려줌
        */}
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl 
              animate-in fade-in slide-in-from-bottom-4 duration-500
              ${toast.type === 'success' ? 'bg-[#2D2D2D] text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-orange-500 text-white' : ''}
            `}
            onClick={() => removeToast(toast.id)}
          >
            <span className="text-xl">
              {toast.type === 'success' && '✨'}
              {toast.type === 'error' && '🚫'}
              {toast.type === 'info' && 'ℹ️'}
              {toast.type === 'warning' && '⚠️'}
            </span>
            {/* 토스트 내용 */}
            <p className="text-[15px] font-bold tracking-tight">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// useToast 커스텀 훅
// -> useContext(ToastContext)를 직접 써도 되는데 번거로우니 useToast로 감싸서 사용
// -> 에러 처리도 같이 해줌(ToastProvider 밖에서 잘못 쓰면 바로 오류를 내서 알려주려고 한 것)
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// 요약
// -> 리액트 Context를 이용해서 앱 어디서든 showToast()만 호출하면 공통 알림창을 띄울 수 있게 만든 전역 토스트 시스템

// 앱흐름
// 1. ToastProvider로 전체를 감싼다
// 2. 자식 컴포넌트에서 useToast()로 showToast를 꺼내 쓴다
// 3. showToast가 필요할 때 호출되면 toasts 배열에 토스트가 추가된다
// 4. 화면에 토스트가 나타난다
// 5. 3초 뒤 자동으로 사라지거나, 클릭하면 즉시 사라진다
