import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import '../Horse-Owner/HorseOwner.css'; // Reuses HorseOwner premium CSS variables and styles

// Import Admin content panels
import AdminDashboardContent from './components/AdminDashboardContent';
import UserManagementContent from './components/UserManagementContent';
import UpgradeUserRoleContent from './components/UpgradeUserRoleContent';
import TournamentsPanel from './components/TournamentsPanel';
import BreedsPanel from './components/BreedsPanel';
import WithdrawalsPanel from './components/WithdrawalsPanel';
import RacesPanel from './components/RacesPanel';

const adminNavLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/usermanagement', label: 'User Management', icon: 'group' },
  { path: '/admin/upgradeuserrole', label: 'Upgrade User Role', icon: 'manage_accounts' },
  { path: '/admin/tournamentmanagement', label: 'Quản Lý Giải Đấu', icon: 'emoji_events' },
  { path: '/admin/racemanagement', label: 'Duyệt Đăng Ký Đua', icon: 'flag' },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: 'account_balance_wallet' }
];

export default function AdminPage() {
  const { user } = useContext(AuthContext);

  const profile = {
    fullName: user?.fullName || 'System Admin',
    avatar: user?.avatarUrl || ''
  };

  return (
    <DashboardLayout navLinks={adminNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardContent />} />
        <Route path="usermanagement" element={<UserManagementContent />} />
        <Route path="upgradeuserrole" element={<UpgradeUserRoleContent />} />
        <Route path="tournamentmanagement" element={<TournamentsPanel />} />
        <Route path="withdrawals" element={<WithdrawalsPanel />} />
        <Route path="racemanagement" element={<RacesPanel />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
