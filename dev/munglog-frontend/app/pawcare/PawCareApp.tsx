'use client';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

export default function PawCareApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/dogs" element={<DogListPage />} />
            <Route path="/dogs/new" element={<DogFormPage />} />
            <Route path="/dogs/edit/:id" element={<DogFormPage />} />
            <Route path="/care-records" element={<CareRecordListPage />} />
            <Route path="/care-records/new" element={<CareRecordFormPage />} />
            <Route path="/care-records/edit/:id" element={<CareRecordFormPage />} />
            <Route path="/care-records/:id" element={<CareRecordDetailPage />} />
            <Route path="/schedules" element={<ScheduleListPage />} />
            <Route path="/schedules/new" element={<ScheduleFormPage />} />
            <Route path="/schedules/edit/:id" element={<ScheduleFormPage />} />
            <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
            <Route path="*" element={<Navigate to="/dogs" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
