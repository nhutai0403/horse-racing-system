import { createContext, useContext, useState, useEffect } from 'react';
import { getOwnerProfileAPI, getMyHorsesAPI, getMyRaceRegistrationsAPI } from '../../services/owner';
import { getFriendsAPI } from '../../services/connections';
import {
  getTournamentsAPI,
  getTournamentRacesAPI,
  getRaceParticipantsAPI,
} from '../../services/races';
import {
  getWalletBalanceAPI,
  getTransactionHistoryAPI
} from '../../services/wallet';
import {
  initialOwnerProfile,
  initialHorses,
  initialSystemUsers,
  initialTournaments,
  initialTransactions,
  initialRaceHistory,
} from './mockData';

const HorseOwnerContext = createContext();

export function HorseOwnerProvider({ children }) {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    identityNumber: '',
    dateOfBirth: '',
    stableName: '',
    stableAddress: '',
    description: '',
    walletBalance: 0,
    avatar: '',
    avatarZoom: 1,
    avatarOffsetX: 0,
    avatarOffsetY: 0
  });
  const [horses, setHorses] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [raceHistory, setRaceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerData = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      }

      // 1. Fetch Profile & Wallet Balance
      let profileData = null;
      try {
        profileData = await getOwnerProfileAPI();
      } catch (err) {
        console.error(err);
      }

      let walletBalance = 0;
      try {
        const balanceData = await getWalletBalanceAPI();
        walletBalance = balanceData.balance;
      } catch (err) {
        console.error('Failed to load wallet balance:', err);
        const savedBalance = localStorage.getItem('owner_wallet_balance');
        walletBalance = savedBalance ? parseFloat(savedBalance) : 0;
      }

      if (profileData) {
        setProfile({
          id: profileData.id,
          fullName: profileData.fullName || '',
          email: profileData.email || '',
          phoneNumber: profileData.phone || '',
          identityNumber: profileData.identityNumber || '',
          dateOfBirth: profileData.dateOfBirth || '',
          stableName: profileData.stableName || '',
          stableAddress: profileData.stableAddress || '',
          description: profileData.description || '',
          walletBalance: walletBalance,
          avatar: profileData.avatarUrl || '',
          avatarZoom: 1,
          avatarOffsetX: 0,
          avatarOffsetY: 0,
        });
        localStorage.setItem('owner_wallet_balance', walletBalance.toString());
      }

      // 2. Fetch Horses
      let horsesData = [];
      try {
        horsesData = await getMyHorsesAPI();
        setHorses(
          horsesData.map((h) => ({
            id: h.id,
            name: h.name,
            breed: h.breedName,
            age: h.age,
            gender: h.gender,
            status: (h.status === 'ACTIVE' || h.status === 'Active' ? 'READY' : h.status) || 'READY',
            owner: profileData ? profileData.fullName : 'Owner',
            matchesPlayed: h.totalRaces || 0,
            winRate: Math.round(h.top1Rate || 0),
            image: h.imageUrl || '',
            top1Rate: Math.round(h.top1Rate || 0),
            top2Rate: Math.round(h.top2Rate || 0),
            top3Rate: Math.round(h.top3Rate || 0),
            metrics: { speed: 85, stamina: 80, gatePerformance: 90 },
          })),
        );
      } catch (err) {
        console.error(err);
      }

      // 3. Fetch Friends
      let friendsData = [];
      try {
        friendsData = await getFriendsAPI();
        setSystemUsers(
          friendsData.map((f) => ({
            id: f.userId,
            fullName: f.fullName,
            email: f.email,
            phoneNumber: f.phone,
            role: f.role,
            friendStatus: f.friendStatus || 'FRIEND',
            avatar: f.avatar,
            experienceYears: f.experienceYears || 5,
            winRate: 50,
            matchesPlayed: 100,
          })),
        );
      } catch (err) {
        console.error(err);
      }

      // 4. Fetch Tournaments and Races
      try {
        let registrationsData = [];
        try {
          registrationsData = await getMyRaceRegistrationsAPI();
        } catch (err) {
          console.error('Không thể lấy danh sách đăng ký thi đấu từ API:', err);
        }

        const tournamentsData = await getTournamentsAPI();
        const allRaces = [];
        for (const t of tournamentsData) {
          let races = [];
          try {
            races = await getTournamentRacesAPI(t.id);
          } catch (e) {
            console.error('Lỗi khi tải vòng đua:', e);
          }

          if (races && races.length > 0) {
            for (const r of races) {
              let participants = [];
              try {
                participants = await getRaceParticipantsAPI(r.id);
              } catch (e) {
                console.error(e);
              }

              const registeredHorsesList = participants
                .filter((p) => horsesData.some((myH) => myH.id === p.horseId))
                .map((p) => p.horseName);

              const apiRegistered = registrationsData
                .filter((reg) => (reg.raceId === r.id || reg.tournamentId === r.id) && reg.status !== 'REJECTED')
                .map((reg) => reg.horseName);

              const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
              const localList = JSON.parse(savedLocal);
              const localRegistered = localList
                .filter((l) => l.raceId === r.id)
                .map((l) => l.horseName);

              const registeredHorsesSet = new Set([
                ...registeredHorsesList,
                ...apiRegistered,
                ...localRegistered,
              ]);

              // Determine status: if tournament status is not Active, owner cannot register
              let displayStatus = t.tournamentStatus || 'Upcoming';

              allRaces.push({
                id: r.id,
                tournamentId: t.id,
                tournamentName: t.tournamentName,
                location: r.raceTrackName || t.location,
                date: r.raceDate || t.startDate,
                time: r.startTime || (t.officialRaceTime ? t.officialRaceTime.substring(11, 16) : '09:00'),
                trackType: `${r.surfaceType || t.surfaceType || 'Grass'} • Dist: ${r.distance || 1200}m`,
                prizePool: `${t.totalPrize ? t.totalPrize.toLocaleString() : '1,000,000'} VND`,
                status: displayStatus, // Use tournament status for displaying to Owner
                allowedClasses: t.allowedClasses,
                registeredHorses: Array.from(registeredHorsesSet),
                entryFee: t.entryFee,
                refereeName: t.refereeName || 'Chưa phân công',
              });
            }
          } else {
            // No races found, create a fallback race representation
            allRaces.push({
              id: null,
              tournamentId: t.id,
              tournamentName: t.tournamentName,
              location: t.location || 'Chưa xác định',
              date: t.startDate || 'Chưa xác định',
              time: t.officialRaceTime ? t.officialRaceTime.substring(11, 16) : '09:00',
              trackType: `${t.surfaceType || 'Grass'} • Dist: 1200m`,
              prizePool: `${t.totalPrize ? t.totalPrize.toLocaleString() : '1,000,000'} VND`,
              status: t.tournamentStatus || 'Upcoming',
              allowedClasses: t.allowedClasses,
              registeredHorses: [],
              entryFee: t.entryFee,
              refereeName: t.refereeName || 'Chưa phân công',
            });
          }
        }
        setTournaments(allRaces);
      } catch (err) {
        console.error(err);
      }

      // Load Transactions
      try {
        const txs = await getTransactionHistoryAPI();
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to load transaction history:', err);
        setTransactions([]);
      }

      // Load Race History
      setRaceHistory(initialRaceHistory);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu chủ ngựa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile.walletBalance !== undefined) {
      localStorage.setItem('owner_wallet_balance', updatedProfile.walletBalance.toString());
    }
  };

  const updateTransactionsState = (updater) => {
    setTransactions((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('owner_transactions', JSON.stringify(next));
      return next;
    });
  };

  const updateRaceHistoryState = (updater) => {
    setRaceHistory((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('owner_race_history', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    profile,
    setProfile: updateProfileState,
    horses,
    setHorses,
    systemUsers,
    setSystemUsers,
    tournaments,
    setTournaments,
    transactions,
    setTransactions: updateTransactionsState,
    raceHistory,
    setRaceHistory: updateRaceHistoryState,
    loading,
    refreshData: () => fetchOwnerData(true),
  };

  return <HorseOwnerContext.Provider value={value}>{children}</HorseOwnerContext.Provider>;
}

export function useHorseOwner() {
  const context = useContext(HorseOwnerContext);
  if (!context) {
    throw new Error('useHorseOwner must be used within a HorseOwnerProvider');
  }
  return context;
}
