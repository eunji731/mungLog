'use client';

import { usePathname } from 'next/navigation';
import DogListPage from '@/features/pets/pages/DogListPage';
import DogFormPage from '@/features/pets/pages/DogFormPage';

function PetsRoute() {
  const pathname = usePathname() ?? '/dogs';
  const segments = pathname.split('/').filter(Boolean);
  const action = segments[1];

  if (action === 'new') return <DogFormPage />;
  if (action === 'edit') return <DogFormPage id={segments[2]} />;
  return <DogListPage />;
}

export default function PetsPage() {
  return (
    <div className="pawcare-integrated min-h-full">
      <PetsRoute />
    </div>
  );
}
