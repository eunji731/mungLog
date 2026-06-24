import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dog } from '@/types/dog';
import { Card } from '@/components/common/Card';

interface DogCardProps {
  dog: Dog;
  onDelete?: (id: string, name: string) => void;
}

export const DogCard: React.FC<DogCardProps> = ({ dog, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(dog.id, dog.name);
    }
  };

  const calculateAge = (birthDate?: string | null) => {
    if (!birthDate) return 'Age Unknown';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age <= 0 ? 'Baby' : `${age}Y`;
  };

  return (
    <Card
      onClick={() => navigate(`/dogs/edit/${dog.id}`)}
      className="group relative aspect-[4/5] overflow-hidden border-none ring-1 ring-black/5 shadow-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
    >
      {/* 1. BACKGROUND IMAGE AREA */}
      <div className="absolute inset-0 bg-surface-green">
        {dog.profileImageUrl ? (
          <img 
            src={dog.profileImageUrl} 
            alt={dog.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-green to-background/50">
            <span className="text-6xl mb-2 opacity-20 group-hover:scale-110 transition-transform duration-700">🐕</span>
            <span className="text-[10px] font-black text-text-sub tracking-[0.2em] uppercase opacity-50">Archives</span>
          </div>
        )}
      </div>

      {/* 2. TOP ACTIONS (OVERLAY) */}
      <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dogs/edit/${dog.id}`);
          }}
          className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-main-green hover:border-main-green transition-all active:scale-90"
        >
          <span className="text-sm">✏️</span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-red-500 hover:border-red-500 transition-all active:scale-90"
        >
          <span className="text-sm">🗑️</span>
        </button>
      </div>

      {/* 3. BOTTOM INFO AREA (OVERLAY WITH GRADIENT) */}
      <div className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end">
        <div className="flex justify-between items-end gap-4">
          <div className="space-y-1">
            <h3 className="text-[32px] font-black text-white tracking-tight leading-none group-hover:text-main-green transition-colors duration-500">
              {dog.name}
            </h3>
            <p className="text-[14px] font-bold text-white/70 tracking-tight flex items-center gap-2">
              <span>{dog.breed || 'Unknown Breed'}</span>
              <span className="w-1 h-1 bg-white/30 rounded-full"></span>
              <span>{calculateAge(dog.birthDate)}</span>
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 mb-1">
            <span className="text-[14px] font-black text-white tabular-nums">
              {dog.weightKg ?? dog.weight ? Number(dog.weightKg ?? dog.weight).toFixed(1) : '0.0'}
              <span className="text-[10px] ml-1 opacity-60 font-bold uppercase">kg</span>
            </span>
          </div>
        </div>
      </div>

      {/* HOVER ACCENT LINE */}
      <div className="absolute bottom-0 left-0 h-1 bg-main-green transition-all duration-700 w-0 group-hover:w-full z-30" />
    </Card>
  );
};
