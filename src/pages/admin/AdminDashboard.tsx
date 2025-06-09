
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Overview from '@/components/admin/Overview';
import CourseManagement from '@/components/admin/CourseManagement';
import UserManagement from '@/components/admin/UserManagement';
import CampaignManagement from '@/components/admin/CampaignManagement';
import Analytics from '@/components/admin/Analytics';
import EscalationManagement from '@/components/admin/EscalationManagement';
import QueriesSupport from '@/components/admin/QueriesSupport';
import IAMManagement from '@/components/admin/IAMManagement';
import TemplatesManagement from '@/components/admin/TemplatesManagement';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/campaigns" element={<CampaignManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/escalations" element={<EscalationManagement />} />
        <Route path="/support" element={<QueriesSupport />} />
        <Route path="/iam" element={<IAMManagement />} />
        <Route path="/templates" element={<TemplatesManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
