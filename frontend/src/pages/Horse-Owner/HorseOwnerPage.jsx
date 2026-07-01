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
import ProfileContent from './ProfileContent';

// Import Spectator components for Horse Owner integration
import SpectatorTournaments from '../Spectator/components/SpectatorTournaments';
import SpectatorLiveSimulationPage from '../Spectator/components/SpectatorLiveSimulationPage';
import SpectatorWallet from '../Spectator/components/SpectatorWallet';

const ownerNavLinks = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/owner/stable', label: 'Horses', icon: 'fence' },
  { path: '/owner/entries', label: 'Race Entries', icon: 'emoji_events' },
  { path: '/owner/friends', label: 'Connections', icon: 'group' },
  { path: '/owner/financials', label: 'Financials', icon: 'account_balance_wallet' },
  { path: '/owner/live', label: 'Live Racing', icon: 'stadium' }
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
        <Route path="profile" element={<ProfileContent />} />
        {/* Integrated spectator routes */}
        <Route path="live" element={<SpectatorLiveSimulationPage />} />
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
