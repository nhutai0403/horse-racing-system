import { Routes, Route, Navigate } from 'react-router-dom';
import { HorseOwnerProvider, useHorseOwner } from './HorseOwnerContext';
import DashboardLayout from '../layouts/DashboardLayout';
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
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/owner/stable', label: 'Stable', icon: 'bedroom_child' },
  { path: '/owner/entries', label: 'Race Entries', icon: 'emoji_events' },
  { path: '/owner/friends', label: 'Connections', icon: 'group' },
  { path: '/owner/financials', label: 'Financials', icon: 'payments' },
  { path: '/owner/analytics', label: 'Analytics', icon: 'analytics' }
];

function HorseOwnerRoutesBridge() {
  const { profile } = useHorseOwner();
  return (
    <DashboardLayout navLinks={ownerNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
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
