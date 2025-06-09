
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Overview from '@/components/admin/Overview';
import UserManagement from '@/components/admin/UserManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import Analytics from '@/components/admin/Analytics';
import SecurityGames from '@/components/admin/SecurityGames';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/games" element={<SecurityGames />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
