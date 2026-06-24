'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { MyPage } from '@/pages/MyPage';
import DogListPage from '@/pages/Dogs/List';
import DogFormPage from '@/pages/Dogs/Form';
import CareRecordListPage from '@/pages/CareRecords/List';
import CareRecordFormPage from '@/pages/CareRecords/Form';
import CareRecordDetailPage from '@/pages/CareRecords/Detail';
import ScheduleListPage from '@/pages/Schedules/List';
import ScheduleFormPage from '@/pages/Schedules/Form';
import ScheduleDetailPage from '@/pages/Schedules/Detail';

function PawCareRoute() {
  const pathname = usePathname() ?? '/dogs';
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0];
  const action = segments[1];

  if (section === 'mypage') return <MyPage />;

  if (section === 'dogs') {
    if (action === 'new' || action === 'edit') return <DogFormPage />;
    return <DogListPage />;
  }

  if (section === 'care-records') {
    if (action === 'new' || action === 'edit') return <CareRecordFormPage />;
    if (action) return <CareRecordDetailPage />;
    return <CareRecordListPage />;
  }

  if (section === 'schedules') {
    if (action === 'new' || action === 'edit') return <ScheduleFormPage />;
    if (action) return <ScheduleDetailPage />;
    return <ScheduleListPage />;
  }

  return <DogListPage />;
}

export default function PawCareApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="pawcare-integrated min-h-full">
          <PawCareRoute />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
