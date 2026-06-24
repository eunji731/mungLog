import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Symptom {
  name: string;
  count: number;
}

interface Schedule {
  id: string | number;
  title: string;
  scheduleDate: string;
  location?: string;
  dDay: number;
}

interface HealthWidgetsProps {
  symptoms?: Symptom[];
  schedules?: Schedule[];
}

export const HealthWidgets: React.FC<HealthWidgetsProps> = ({ symptoms = [], schedules = [] }) => {
  const navigate = useNavigate();

  // 월 이름 변환용
  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  const getDayNumber = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  return (
    <div className="space-y-12">
      {/* 1. UPCOMING SCHEDULES */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-black text-[#2D2D2D] tracking-tight">Upcoming</h3>
          <button 
            onClick={() => navigate('/schedules')}
            className="text-[12px] font-black text-stone-300 hover:text-[#FF6B00] transition-colors uppercase tracking-widest"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <div 
                key={schedule.id} 
                onClick={() => navigate(`/schedules/${schedule.id}`)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50/50 border border-transparent hover:border-orange-100 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex flex-col items-center justify-center shadow-sm shrink-0">
                  <span className="text-[9px] font-black text-stone-400 leading-none mb-1">{getMonthName(schedule.scheduleDate)}</span>
                  <span className="text-[16px] font-black text-[#2D2D2D] leading-none">{getDayNumber(schedule.scheduleDate)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-[#2D2D2D] truncate">{schedule.title}</h4>
                  <p className="text-[12px] font-medium text-stone-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-stone-200"></span> {schedule.location || '장소 미정'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-tighter ${schedule.dDay <= 3 ? 'bg-red-50 text-red-500' : 'bg-stone-100 text-stone-400'}`}>
                  D-{schedule.dDay === 0 ? 'Day' : schedule.dDay}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-stone-300 text-[13px] font-medium">예정된 일정이 없습니다.</div>
          )}
        </div>
      </section>

      {/* 2. SYMPTOM RANKING */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-black text-[#2D2D2D] tracking-tight">Symptom Rank</h3>
          <span className="text-[11px] font-black text-stone-300 uppercase tracking-widest">Selected Period</span>
        </div>
        
        <div className="space-y-4">
          {symptoms.length > 0 ? (
            symptoms.map((symptom, idx) => {
              const maxCount = symptoms[0].count; // 가장 높은 빈도수 기준
              const percentage = (symptom.count / maxCount) * 100;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[13px] font-bold">
                    <span className="text-[#2D2D2D]">{symptom.name}</span>
                    <span className="text-[#FF6B00] tabular-nums">{symptom.count}회</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF6B00] rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-stone-300 text-[13px] font-medium">등록된 증상 데이터가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
};
