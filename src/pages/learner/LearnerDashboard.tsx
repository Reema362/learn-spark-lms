
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LearnerLayout from '@/components/learner/LearnerLayout';
import Courses from '@/components/learner/Courses';
import Certifications from '@/components/learner/Certifications';
import Gamification from '@/components/learner/Gamification';
import Help from '@/components/learner/Help';

const LearnerDashboard = () => {
  return (
    <LearnerLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/learner/courses" replace />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/gamification" element={<Gamification />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </LearnerLayout>
  );
};

export default LearnerDashboard;
