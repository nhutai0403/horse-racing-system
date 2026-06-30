import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../Home/Home';
import '../Dashboard.css';
import '../Horse-Owner/HorseOwner.css';

// Import Referee Components
import RefereeDashboardContent from './RefereeDashboardContent';
import PreRaceCheck from './PreRaceCheck';
import LiveSimulation from './LiveSimulation';
import ConfirmResults from './ConfirmResults';
import Violations from './Violations';

const refereeNavLinks = [
  { path: '/referee/home', label: 'Home', icon: 'home' },
  { path: '/referee/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/referee/pre-race-check', label: 'Pre-Race Check', icon: 'fact_check' },
  { path: '/referee/live-simulation', label: 'Live Simulation', icon: 'sports_score' },
  { path: '/referee/violations', label: 'Violations & Flags', icon: 'gavel' },
  { path: '/spectator/tournaments', label: 'Betting', icon: 'local_atm' },
  { path: '/spectator/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' }
];

export default function RefereePage() {
  return (
    <DashboardLayout navLinks={refereeNavLinks}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<RefereeDashboardContent />} />
        <Route path="pre-race-check" element={<PreRaceCheck />} />
        <Route path="live-simulation" element={<LiveSimulation />} />
        <Route path="live simulation" element={<LiveSimulation />} />
        <Route path="violations" element={<Violations />} />
      </Routes>
    </DashboardLayout>
  );
}
