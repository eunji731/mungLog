import React, { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  label?: string; // label 속성 추가
  tags: string[];
  suggestions?: string[];
  placeholder?: string;
  onInputChange?: (value: string) => void;
  onChange: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  suggestions = [],
  placeholder = '태그 입력...',
  onInputChange,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim()) {
      setShowSuggestions(true);
    }
    if (onInputChange) onInputChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const filteredSuggestions = suggestions.filter(s => !tags.includes(s));

  return (
    <div className="space-y-2 w-full" ref={containerRef}>
      {/* Label 렌더링 추가 */}
      {label && (
        <label className="text-[12px] font-black text-stone-400 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 bg-white border border-stone-200 rounded-xl focus-within:border-[#FF6B00] transition-all min-h-[52px]">
          {tags.map((tag, index) => (
            <span 
              key={`${tag}-${index}`} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00]/10 text-[#FF6B00] text-[13px] font-bold rounded-lg animate-in zoom-in-95 duration-200"
            >
              #{tag}
              <button 
                type="button" 
                onClick={() => removeTag(index)}
                className="hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if(inputValue.trim()) setShowSuggestions(true); }}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-grow bg-transparent border-none outline-none text-[14px] text-stone-700 min-w-[120px]"
          />
        </div>

        {/* 추천 목록 */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div 
            className="absolute left-0 right-0 z-[9999] mt-2 bg-white border border-stone-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-h-[240px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ top: '100%' }}
          >
            <div className="p-2">
              <div className="px-3 py-2 text-[11px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-50 mb-1">
                추천 증상
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 text-[14px] font-bold text-stone-600 hover:text-[#FF6B00] rounded-xl transition-all flex items-center gap-2"
                >
                  <span className="text-orange-300">#</span>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
