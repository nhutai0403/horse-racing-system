import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import '../Dashboard.css';
import '../Horse-Owner/HorseOwner.css';

// Import Referee Components
import RefereeDashboardContent from './RefereeDashboardContent';
import PreRaceCheck from './PreRaceCheck';
import LiveSimulation from './LiveSimulation';
import ConfirmResults from './ConfirmResults';
import Violations from './Violations';

const refereeNavLinks = [
  { path: '/referee/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/referee/pre-race-check', label: 'Pre-Race Check', icon: 'fact_check' },
  { path: '/referee/live-simulation', label: 'Live Simulation', icon: 'sports_score' },
  { path: '/referee/confirm-results', label: 'Confirm Results', icon: 'verified' },
  { path: '/referee/violations', label: 'Violations & Flags', icon: 'gavel' }
];

export default function RefereePage() {
  return (
    <DashboardLayout navLinks={refereeNavLinks}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RefereeDashboardContent />} />
        <Route path="pre-race-check" element={<PreRaceCheck />} />
        <Route path="live-simulation" element={<LiveSimulation />} />
        <Route path="confirm-results" element={<ConfirmResults />} />
        <Route path="violations" element={<Violations />} />
      </Routes>
    </DashboardLayout>
  );
}
