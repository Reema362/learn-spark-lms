
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Overview from '@/components/admin/Overview';
import UserManagement from '@/components/admin/UserManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import CampaignManagement from '@/components/admin/CampaignManagement';
import EscalationManagement from '@/components/admin/EscalationManagement';
import QueriesSupport from '@/components/admin/QueriesSupport';
import IAMManagement from '@/components/admin/IAMManagement';
import TemplatesManagement from '@/components/admin/TemplatesManagement';
import GamificationManagement from '@/components/admin/GamificationManagement';
import Analytics from '@/components/admin/Analytics';
import SecurityGames from '@/components/admin/SecurityGames';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/campaigns" element={<CampaignManagement />} />
        <Route path="/escalations" element={<EscalationManagement />} />
        <Route path="/queries" element={<QueriesSupport />} />
        <Route path="/iam" element={<IAMManagement />} />
        <Route path="/templates" element={<TemplatesManagement />} />
        <Route path="/gamification" element={<GamificationManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/security-games" element={<SecurityGames />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;
