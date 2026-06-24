export const MainDataGrid = () => {
  const dummyData = [
    { id: 1, date: '26.03.15', category: '병원', clinic: '튼튼동물병원', desc: '심장사상충 예방접종', amount: 50000 },
    { id: 2, date: '26.03.02', category: '병원', clinic: '튼튼동물병원', desc: '기본검진 및 엑스레이', amount: 80000 },
    { id: 3, date: '26.03.02', category: '지출', clinic: '튼튼동물병원', desc: '구충제(내부)', amount: 20000 },
    { id: 4, date: '26.02.10', category: '지출', clinic: '해피펫온라인', desc: '관절영양제 2박스', amount: 45000 },
    { id: 5, date: '26.01.25', category: '병원', clinic: '플러스동물병원', desc: '피부병 진료 및 연고 처방', amount: 35000 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col h-[400px]">
      {/* 타이틀 영역 - 연한 베이지 백그라운드 적용 */}
      <div className="px-5 py-3.5 border-b border-orange-100 bg-[#FFF9F2]/50 flex justify-between items-center shrink-0 rounded-t-2xl">
        <h2 className="text-[13px] font-bold text-stone-800 flex items-center gap-1.5">
          <span className="text-[15px]">🏥</span> 최근 종합 기록 (병원 + 지출)
        </h2>
        <div className="flex items-center gap-2">
          <button className="text-[11px] font-bold text-stone-500 border border-orange-200 bg-white px-2 py-0.5 rounded-lg hover:bg-orange-50 transition-colors">전체보기</button>
        </div>
      </div>

      {/* 조밀한 테이블 영역 - th 배경을 연한 베이지색으로 */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
          <thead className="bg-[#FFF9F2] text-stone-600 sticky top-0 border-b border-orange-100 font-bold z-10 shadow-[0_1px_0_0_#ffedd5]">
            <tr>
              <th className="px-5 py-2.5 w-20 tracking-tight">날짜</th>
              <th className="px-5 py-2.5 w-16 text-center tracking-tight">분류</th>
              <th className="px-5 py-2.5 tracking-tight">병원/사용처</th>
              <th className="px-5 py-2.5 w-full tracking-tight">상세내용</th>
              <th className="px-5 py-2.5 text-right tracking-tight">금액(원)</th>
            </tr>
          </thead>
          <tbody className="text-stone-700 font-medium">
            {dummyData.map((row) => (
              // 얇고 환한 border 적용 및 호버 색상 웜톤으로
              <tr key={row.id} className="border-b border-stone-100 hover:bg-orange-50/50 transition-colors cursor-pointer last:border-0">
                <td className="px-5 py-3 text-stone-500 font-normal">{row.date}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-block px-1.5 py-px rounded-md text-[10px] font-bold ${
                    row.category === '병원' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    {row.category}
                  </span>
                </td>
                <td className="px-5 py-3 text-stone-800">{row.clinic}</td>
                <td className="px-5 py-3 text-stone-600 truncate max-w-[250px]">{row.desc}</td>
                <td className="px-5 py-3 text-right font-bold text-stone-900">
                  {row.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 하단 버튼 영역 - 다꾸 스타일의 예쁜 라운드 버튼과 포인트 색상 적용 */}
      <div className="p-3 border-t border-orange-100 bg-[#FFF9F2]/30 flex justify-end gap-2.5 shrink-0 rounded-b-2xl">
        <button className="text-[12px] font-bold px-4 py-2 hover:bg-white bg-orange-50 border border-orange-200 text-stone-700 rounded-xl shadow-sm hover:text-amber-700 transition-colors">
          ➕ 새 병원 기록
        </button>
        <button className="text-[12px] font-bold px-4 py-2 bg-amber-500 border border-transparent text-white rounded-xl shadow-sm hover:bg-amber-600 transition-colors">
          💸 새 비용 기록
        </button>
      </div>
    </div>
  );
};
