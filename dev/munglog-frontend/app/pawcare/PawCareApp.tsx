'use client';

import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/context/ToastContext';
import DogListPage from '@/pages/Dogs/List';
import DogFormPage from '@/pages/Dogs/Form';
import CareRecordListPage from '@/features/care-records/pages/CareRecordListPage';
import CareRecordFormPage from '@/features/care-records/pages/CareRecordFormPage';
import CareRecordDetailPage from '@/features/care-records/pages/CareRecordDetailPage';
import ScheduleListPage from '@/pages/Schedules/List';
import ScheduleFormPage from '@/pages/Schedules/Form';
import ScheduleDetailPage from '@/pages/Schedules/Detail';

function PawCareRoute() {
  const pathname = usePathname() ?? '/dogs';
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0];
  const action = segments[1];

  if (section === 'dogs') {
    if (action === 'new') return <DogFormPage />;
    if (action === 'edit') return <DogFormPage id={segments[2]} />;
    return <DogListPage />;
  }

  if (section === 'care-records') {
    if (action === 'new') return <CareRecordFormPage />;
    if (action === 'edit') return <CareRecordFormPage id={segments[2]} />;
    if (action) return <CareRecordDetailPage id={action} />;
    return <CareRecordListPage />;
  }

  if (section === 'schedules') {
    if (action === 'new') return <ScheduleFormPage />;
    if (action === 'edit') return <ScheduleFormPage id={segments[2]} />;
    if (action) return <ScheduleDetailPage id={action} />;
    return <ScheduleListPage />;
  }

  return <DogListPage />;
}

export default function PawCareApp() {
  return (
    <ToastProvider>
      <div className="pawcare-integrated min-h-full">
        <PawCareRoute />
      </div>
    </ToastProvider>
  );
}
