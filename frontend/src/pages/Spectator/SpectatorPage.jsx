import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Import Spectator components
import SpectatorDashboardContent from './components/SpectatorDashboardContent';
import SpectatorTournaments from './components/SpectatorTournaments';
import SpectatorWallet from './components/SpectatorWallet';
import SpectatorUpgradeRole from './components/SpectatorUpgradeRole';
import SpectatorChatbot from './components/SpectatorChatbot';

import './Spectator.css';

const spectatorNavLinks = [
  { path: '/spectator/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/spectator/tournaments', label: 'Giải Đấu & Vòng Đua', icon: 'emoji_events' },
  { path: '/spectator/wallet', label: 'Ví & Giao Dịch', icon: 'account_balance_wallet' },
  { path: '/spectator/upgrade', label: 'Nâng Cấp Tài Khoản', icon: 'manage_accounts' },
  { path: '/spectator/chat', label: 'Trợ Lý Ảo AI', icon: 'forum' }
];

export default function SpectatorPage() {
  const { user } = useContext(AuthContext);

  const profile = {
    fullName: user?.fullName || 'Spectator Member',
    avatar: user?.avatarUrl || ''
  };

  return (
    <DashboardLayout navLinks={spectatorNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SpectatorDashboardContent />} />
        <Route path="tournaments" element={<SpectatorTournaments />} />
        <Route path="wallet" element={<SpectatorWallet />} />
        <Route path="upgrade" element={<SpectatorUpgradeRole />} />
        <Route path="chat" element={<SpectatorChatbot />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
