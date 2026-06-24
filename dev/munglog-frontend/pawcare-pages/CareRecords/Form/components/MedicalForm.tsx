import React, { useState, useEffect, useRef } from 'react';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { TagInput } from '@/components/common/TagInput';
import { careApi } from '@/api/careApi';

interface MedicalFormProps {
  data: {
    clinicName: string;
    symptoms: string; // 기존 서술형 텍스트 필드 유지
    symptomTags: string[]; // 새롭게 추가된 태그 필드
    diagnosis: string;
    treatment: string;
    amount: string | number;
    hasMedication: boolean;
    medicationStartDate: string;
    medicationDays: string | number;
    isMedicationCompleted: boolean;
  };
  onChange: (data: any) => void;
}

export const MedicalForm: React.FC<MedicalFormProps> = ({ data, onChange }) => {
  const [symptomSuggestions, setSymptomSuggestions] = useState<string[]>([]);
  const debounceTimerRef = useRef<number | null>(null);

  // 증상 마스터 검색 (Debounce 적용)
  const handleSymptomSearch = (keyword: string) => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    
    // 키워드가 없으면 빈 목록으로 초기화
    if (!keyword.trim()) {
      setSymptomSuggestions([]);
      return;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const results = await careApi.searchSymptomMasters(keyword);
        setSymptomSuggestions(results);
      } catch (err) {
        console.error('Failed to search symptoms:', err);
      }
    }, 300);
  };

  return (
    <div className="space-y-10">
      <Section title="진료 정보" description="병원에서 어떤 증상이 있었나요?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Input 
            label="방문 병원 *" 
            placeholder="동물병원 이름을 입력하세요." 
            value={data.clinicName} 
            onChange={(e) => onChange({ ...data, clinicName: e.target.value })} 
          />
          <div className="space-y-2">
            <label className="text-[12px] font-black text-stone-400 uppercase tracking-widest pl-1">주요 증상 (태그) *</label>
            <TagInput 
              tags={data.symptomTags || []}
              suggestions={symptomSuggestions}
              placeholder="증상을 입력하세요 (엔터로 추가)"
              onInputChange={handleSymptomSearch} // 사용자가 입력할 때마다 검색 실행
              onChange={(tags) => onChange({ ...data, symptomTags: tags })}
            />
          </div>
        </div>

        <Textarea 
          label="발현 증상 상세" 
          placeholder="강아지가 보인 증상을 자세히 기록해 주세요." 
          value={data.symptoms} 
          onChange={(e) => onChange({ ...data, symptoms: e.target.value })} 
        />
      </Section>

      <Section title="진단 및 처방" description="수의사 선생님의 소견은 어떠했나요?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Input 
            label="진단명" 
            placeholder="예: 급성 위염" 
            value={data.diagnosis} 
            onChange={(e) => onChange({ ...data, diagnosis: e.target.value })} 
          />
          <div className="relative">
            <Input 
              label="진료비" 
              type="number" 
              placeholder="0" 
              value={data.amount} 
              onChange={(e) => onChange({ ...data, amount: e.target.value })} 
            />
            <span className="absolute right-5 bottom-4 text-[13px] font-black text-stone-300 uppercase">원</span>
          </div>
        </div>
        <Textarea 
          label="처방 및 치료 내용" 
          placeholder="처방받은 약이나 향후 주의사항을 기록하세요." 
          value={data.treatment} 
          onChange={(e) => onChange({ ...data, treatment: e.target.value })} 
        />
      </Section>

      <Section title="복약 관리" description="가정에서의 약 복용 계획이 있나요?">
        <div className="space-y-8 bg-stone-50/50 p-8 rounded-[32px] border border-stone-100">
          <div className="flex items-center gap-4">
            <input 
              type="checkbox" 
              id="hasMedication" 
              className="w-5 h-5 accent-[#FF6B00] rounded"
              checked={data.hasMedication}
              onChange={(e) => onChange({ ...data, hasMedication: e.target.checked })}
            />
            <label htmlFor="hasMedication" className="text-[15px] font-bold text-stone-700 cursor-pointer">복약 처방이 있습니다.</label>
          </div>

          {data.hasMedication && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
              <Input 
                label="복약 시작일" 
                type="date" 
                value={data.medicationStartDate} 
                onChange={(e) => onChange({ ...data, medicationStartDate: e.target.value })} 
              />
              <div className="relative">
                <Input 
                  label="복약 일수" 
                  type="number" 
                  placeholder="예: 3" 
                  value={data.medicationDays} 
                  onChange={(e) => onChange({ ...data, medicationDays: e.target.value })} 
                />
                <span className="absolute right-5 bottom-4 text-[13px] font-black text-stone-300 uppercase">일</span>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};
