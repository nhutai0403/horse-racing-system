import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../Home/Home';
import '../Dashboard.css';
import '../Horse-Owner/HorseOwner.css';

// Import Referee Components
import PreRaceCheck from './PreRaceCheck';
import LiveSimulation from './LiveSimulation';
import ConfirmResults from './ConfirmResults';
import Violations from './Violations';

const refereeNavLinks = [
  { path: '/referee/home', label: 'Trang Chủ', icon: 'home' },
  { path: '/referee/pre-race-check', label: 'Kiểm Tra Trước Trận', icon: 'fact_check' },
  { path: '/referee/live-simulation', label: 'Mô Phỏng Trực Tiếp', icon: 'sports_score' },
  { path: '/referee/violations', label: 'Cảnh Cáo & Vi Phạm', icon: 'gavel' }
];

export default function RefereePage() {
  return (
    <DashboardLayout navLinks={refereeNavLinks}>
      <Routes>
        <Route index element={<Navigate to="pre-race-check" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="pre-race-check" element={<PreRaceCheck />} />
        <Route path="live-simulation" element={<LiveSimulation />} />
        <Route path="live simulation" element={<LiveSimulation />} />
        <Route path="violations" element={<Violations />} />
      </Routes>
    </DashboardLayout>
  );
}
