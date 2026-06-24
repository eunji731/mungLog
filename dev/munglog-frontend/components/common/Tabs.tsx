interface TabListProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: TabListProps) => {
  return (
    <div className={`flex gap-8 text-[14px] font-black ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 border-b-[2px] transition-all duration-300 cursor-pointer ${
            activeTab === tab.id 
              ? 'border-[#FF6B00] text-[#2D2D2D]' 
              : 'border-transparent text-stone-300 hover:text-stone-500 hover:border-stone-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
