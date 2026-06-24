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
              ? 'border-main-green text-foreground' 
              : 'border-transparent text-text-sub hover:text-foreground hover:border-border'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
