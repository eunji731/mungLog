import React from 'react';

interface KpiCardsProps {
  data?: {
    totalExpense: number;
    medicalCount: number;
    activeMedicationCount: number;
    upcomingScheduleCount: number;
  };
  isLoading: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, isLoading }) => {
  const cards = [
    {
      label: 'Total Expenses',
      value: `${data?.totalExpense?.toLocaleString() || 0}원`,
      icon: '💳',
      color: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Medical Visits',
      value: `${data?.medicalCount || 0}회`,
      icon: '🏥',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Medication',
      value: `${data?.activeMedicationCount || 0}건`,
      icon: '💊',
      color: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Upcoming',
      value: `${data?.upcomingScheduleCount || 0}건`,
      icon: '📅',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex flex-col gap-4">
            <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <div className="space-y-1">
              <span className="text-[12px] font-black text-stone-400 uppercase tracking-widest">{card.label}</span>
              <h2 className={`text-[28px] font-black ${isLoading ? 'animate-pulse text-stone-200' : 'text-[#2D2D2D]'} tracking-tight tabular-nums`}>
                {isLoading ? '---' : card.value}
              </h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
