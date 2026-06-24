import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Record {
  id: string | number;
  type: string;
  date: string;
  title: string;
  amount: number;
}

interface MainDataTableProps {
  records?: Record[];
  isLoading: boolean;
}

export const MainDataTable: React.FC<MainDataTableProps> = ({ records = [], isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-[20px] font-black text-[#2D2D2D] tracking-tight">Recent Activity</h3>
          <p className="text-[13px] text-stone-400 font-medium">최근 등록된 건강 기록 및 지출 내역입니다.</p>
        </div>
        <button 
          onClick={() => navigate('/care-records')}
          className="px-5 py-2.5 rounded-xl border border-stone-100 text-[12px] font-bold text-stone-500 hover:bg-stone-50 transition-all"
        >
          전체보기
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[11px] font-black text-stone-300 uppercase tracking-widest px-4">
              <th className="pb-2 pl-4">Type</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Title</th>
              <th className="pb-2 text-right pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="h-16 bg-stone-50 rounded-2xl mb-3"></td>
                </tr>
              ))
            ) : records.length > 0 ? (
              records.map((record) => (
                <tr 
                  key={record.id}
                  onClick={() => navigate(`/care-records/${record.id}`)}
                  className="group cursor-pointer"
                >
                  <td className="py-4 pl-4 bg-white border-y border-l border-stone-100 rounded-l-2xl group-hover:bg-stone-50/50 transition-all">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${record.type === 'MEDICAL' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-[#FF6B00]'}`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="py-4 bg-white border-y border-stone-100 text-[14px] font-bold text-[#2D2D2D] tabular-nums group-hover:bg-stone-50/50 transition-all">
                    {record.date}
                  </td>
                  <td className="py-4 bg-white border-y border-stone-100 text-[15px] font-black text-[#2D2D2D] group-hover:bg-stone-50/50 transition-all">
                    {record.title}
                  </td>
                  <td className="py-4 pr-4 bg-white border-y border-r border-stone-100 rounded-r-2xl text-right group-hover:bg-stone-50/50 transition-all">
                    <span className="text-[15px] font-black text-[#2D2D2D] tabular-nums">
                      {record.amount?.toLocaleString() || 0}
                      <span className="text-[11px] ml-1 text-stone-400 font-bold">원</span>
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center text-stone-300 font-bold bg-white border border-dashed border-stone-100 rounded-2xl">
                  최근 활동 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
