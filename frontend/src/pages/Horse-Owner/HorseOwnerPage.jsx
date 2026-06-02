import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import SidebarNav from './components/SidebarNav';
import TopHeader from './components/TopHeader';
import DashboardContent from './components/DashboardContent';
import StableContent from './components/StableContent';
import RaceEntriesContent from './components/RaceEntriesContent';
import FinancialsContent from './components/FinancialsContent';
import AnalyticsContent from './components/AnalyticsContent';
import ConnectionsContent from './components/ConnectionsContent';
import ProfileContent from './components/ProfileContent';
import './HorseOwner.css';

import {
  initialOwnerProfile,
  initialHorses,
  initialSystemUsers,
  initialTournaments,
  initialTransactions,
  initialRaceHistory
} from './mockData';

export default function HorseOwnerPage() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  // React state hooks using central mock database
  const [profile, setProfile] = useState(initialOwnerProfile);
  const [horses, setHorses] = useState(initialHorses);
  const [systemUsers, setSystemUsers] = useState(initialSystemUsers);
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [raceHistory, setRaceHistory] = useState(initialRaceHistory);

  const renderContent = () => {
    switch (activeTab) {
      case 'stable':
        return <StableContent horses={horses} setHorses={setHorses} />;
      case 'entries':
        return <RaceEntriesContent />;
      case 'friends':
        return (
          <ConnectionsContent
            systemUsers={systemUsers}
            setSystemUsers={setSystemUsers}
          />
        );
      case 'financials':
        return <FinancialsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'profile':
        return (
          <ProfileContent
            profile={profile}
            setProfile={setProfile}
            transactions={transactions}
            setTransactions={setTransactions}
            raceHistory={raceHistory}
          />
        );
      default:
        return <DashboardContent setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="d-flex w-100 vh-100 overflow-hidden ho-wrapper">
      {/* Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />

      {/* Main Content Pane */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-hidden">
        {/* Top Navigation Bar */}
        <TopHeader user={user} profile={profile} setActiveTab={setActiveTab} />

        {/* Scrollable Viewport */}
        <main className="flex-grow-1 p-4 p-md-5 overflow-y-auto" style={{ backgroundColor: 'var(--ho-bg-cream)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
