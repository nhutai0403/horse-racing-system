import { Routes, Route, Navigate } from 'react-router-dom';
import { HorseOwnerProvider, useHorseOwner } from './HorseOwnerContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../Home/Home';
import './HorseOwner.css';

// Import subviews locally
import DashboardContent from './DashboardContent';
import StableContent from './StableContent';
import RaceEntriesContent from './RaceEntriesContent';
import ConnectionsContent from './ConnectionsContent';
import FinancialsContent from './FinancialsContent';
import AnalyticsContent from './AnalyticsContent';
import ProfileContent from './ProfileContent';

const ownerNavLinks = [
  { path: '/owner/home', label: 'Home', icon: 'home' },
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/owner/stable', label: 'Stable', icon: 'bedroom_child' },
  { path: '/owner/entries', label: 'Race Entries', icon: 'emoji_events' },
  { path: '/owner/friends', label: 'Connections', icon: 'group' },
  { path: '/owner/financials', label: 'Financials', icon: 'payments' },
  { path: '/owner/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/spectator/tournaments', label: 'Betting', icon: 'local_atm' },
  { path: '/spectator/live', label: 'Live Simulation', icon: 'live_tv' },
  { path: '/spectator/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' }
];

function HorseOwnerRoutesBridge() {
  const { profile, loading } = useHorseOwner();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        color: 'var(--ho-primary-dark)',
        fontFamily: 'sans-serif'
      }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="fw-bold fs-5">Đang tải dữ liệu chuồng ngựa...</div>
      </div>
    );
  }

  return (
    <DashboardLayout navLinks={ownerNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="stable" element={<StableContent />} />
        <Route path="entries" element={<RaceEntriesContent />} />
        <Route path="friends" element={<ConnectionsContent />} />
        <Route path="financials" element={<FinancialsContent />} />
        <Route path="analytics" element={<AnalyticsContent />} />
        <Route path="profile" element={<ProfileContent />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function HorseOwnerPage() {
  return (
    <HorseOwnerProvider>
      <HorseOwnerRoutesBridge />
    </HorseOwnerProvider>
  );
}
