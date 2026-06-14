import { createContext, useContext, useState } from 'react';
import {
  initialOwnerProfile,
  initialHorses,
  initialSystemUsers,
  initialTournaments,
  initialTransactions,
  initialRaceHistory
} from './mockData';

const HorseOwnerContext = createContext();

export function HorseOwnerProvider({ children }) {
  const [profile, setProfile] = useState(initialOwnerProfile);
  const [horses, setHorses] = useState(initialHorses);
  const [systemUsers, setSystemUsers] = useState(initialSystemUsers);
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [raceHistory, setRaceHistory] = useState(initialRaceHistory);

  const value = {
    profile,
    setProfile,
    horses,
    setHorses,
    systemUsers,
    setSystemUsers,
    tournaments,
    setTournaments,
    transactions,
    setTransactions,
    raceHistory,
    setRaceHistory
  };

  return (
    <HorseOwnerContext.Provider value={value}>
      {children}
    </HorseOwnerContext.Provider>
  );
}

export function useHorseOwner() {
  const context = useContext(HorseOwnerContext);
  if (!context) {
    throw new Error('useHorseOwner must be used within a HorseOwnerProvider');
  }
  return context;
}
