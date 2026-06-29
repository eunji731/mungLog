import React from 'react';
import { Section } from '@/components/common/Section';
import { Input } from '@/components/common/Input';
import TimelineDatePicker from '@/features/calendar/components/TimelineDatePicker';
import { Textarea } from '@/components/common/Textarea';
import { usePet } from '@/app/common/hooks/usePet';
import { Select } from '@/components/common/Select';

interface CommonInfoFormProps {
  data: {
    dogId: string | number;
    recordDate: string;
    title: string;
    note: string;
  };
  onChange: (data: any) => void;
  isEmbedded?: boolean;
}

export const CommonInfoForm: React.FC<CommonInfoFormProps> = ({ data, onChange, isEmbedded = false }) => {
  const { pets: dogs } = usePet();

  return (
    <Section
      title="기본 정보"
      description="어떤 아이의 어떤 날 기록인가요?"
      variant={isEmbedded ? 'flat' : 'default'}
      overflowVisible={true}
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isEmbedded ? 'gap-3 mb-3' : 'gap-6 mb-6'}`}>

        {/* Custom Cute Dog Dropdown */}
        <Select
          label="아이 선택"
          value={data.dogId}
          onChange={(e) => onChange({ ...data, dogId: e.target.value })}
          options={dogs.map(d => ({
            label: d.name,
            value: d.id.toString(),
            photo: d.photo || '',
            subLabel: d.breed || '믹스견'
          }))}
          placeholder="아이 선택"
        />

        <TimelineDatePicker
          label="기록일 *"
          variant="form"
          value={data.recordDate}
          onChange={(date) => onChange({ ...data, recordDate: date })}
        />
      </div>
      <div className={isEmbedded ? 'space-y-3' : 'space-y-6'}>
        <Input
          label="제목 *"
          placeholder="오늘의 주요 활동이나 병원 방문 목적"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
        <Textarea
          label="공통 메모"
          placeholder="추가적으로 남기고 싶은 내용을 자유롭게 적어주세요."
          value={data.note}
          onChange={(e) => onChange({ ...data, note: e.target.value })}
        />
      </div>
    </Section>
  );
};

