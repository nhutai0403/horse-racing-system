import { createContext, useContext, useState, useEffect } from 'react';
import { getProfileAPI } from '../../services/auth';
import { getFriendsAPI } from '../../services/connections';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI } from '../../services/races';
import {
  getJockeyProfileAPI,
  updateJockeyProfileAPI,
  getJockeyInvitationsAPI,
  respondToJockeyInvitationAPI,
  getJockeyScheduleAPI,
  getJockeyHistoryAPI,
  getJockeyLeaderboardAPI
} from '../../services/jockey';
import {
  getWalletBalanceAPI,
  getTransactionHistoryAPI
} from '../../services/wallet';
import {
  initialJockeyProfile,
  initialJockeyInvitations,
  initialJockeyTransactions,
  initialJockeyRaceHistory,
  initialJockeysLeaderboard
} from './mockData';

const JockeyContext = createContext();

export function JockeyProvider({ children }) {
  const [profile, setProfile] = useState(initialJockeyProfile);
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [raceHistory, setRaceHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState(initialJockeysLeaderboard);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJockeyData = async () => {
    try {
      setLoading(true);

      // 1. Load Profile & Wallet Balance via APIs
      let jockeyProfile = initialJockeyProfile;
      try {
        jockeyProfile = await getJockeyProfileAPI();
      } catch (err) {
        console.error('Failed to load jockey profile:', err);
      }

      let walletBalance = 0;
      try {
        const balanceData = await getWalletBalanceAPI();
        walletBalance = balanceData.balance;
      } catch (err) {
        console.error('Failed to load jockey wallet balance:', err);
      }

      const mergedProfile = {
        ...initialJockeyProfile,
        ...jockeyProfile,
        fullName: jockeyProfile.fullName || jockeyProfile.user?.fullName || initialJockeyProfile.fullName,
        email: jockeyProfile.email || jockeyProfile.user?.email || initialJockeyProfile.email,
        phoneNumber: jockeyProfile.phone || jockeyProfile.phoneNumber || jockeyProfile.user?.phone || initialJockeyProfile.phoneNumber,
        experienceYears: jockeyProfile.experienceYear || jockeyProfile.experienceYears || initialJockeyProfile.experienceYears,
        walletBalance: walletBalance,
        avatar: jockeyProfile.avatarUrl || jockeyProfile.user?.avatarUrl || initialJockeyProfile.avatar
      };

      setProfile(mergedProfile);
      localStorage.setItem('jockey_profile', JSON.stringify(mergedProfile));
      localStorage.setItem('jockey_wallet_balance', walletBalance.toString());

      // 2. Load Friends (via existing connections API)
      try {
        const friendsData = await getFriendsAPI();
        setFriends(friendsData);
      } catch (err) {
        console.error('Failed to load friends list:', err);
      }

      // 3. Load Public Tournaments & Races
      try {
        const tournamentsData = await getTournamentsAPI();
        const allRaces = [];
        for (const t of tournamentsData) {
          try {
            const races = await getTournamentRacesAPI(t.id);
            for (const r of races) {
              let participants = [];
              try {
                participants = await getRaceParticipantsAPI(r.id);
              } catch (e) {
                console.warn(`Could not load participants for race ${r.id}`);
              }
              
              allRaces.push({
                id: r.id,
                tournamentId: t.id,
                tournamentName: t.tournamentName,
                raceName: r.raceName,
                location: r.raceTrackName || t.location,
                date: r.raceDate,
                time: r.startTime,
                trackType: `${r.surfaceType || 'Dirt'} • Dist: ${r.distance || 1200}m`,
                prizePool: `${t.totalPrize ? t.totalPrize.toLocaleString() : '1,000,000'} VND`,
                status: r.status || 'Upcoming',
                participants: participants
              });
            }
          } catch (err) {
            console.error(`Failed to load races for tournament ${t.id}:`, err);
          }
        }
        setTournaments(allRaces);
      } catch (err) {
        console.error('Failed to load public tournaments:', err);
      }

      // 4. Load Invitations
      try {
        const invs = await getJockeyInvitationsAPI();
        const mappedInvs = invs.map(inv => ({
          id: inv.id,
          ownerId: inv.ownerId,
          ownerName: inv.ownerName,
          stableName: 'Trang trại liên kết',
          horseName: inv.horseName,
          horseBreed: 'Thoroughbred',
          tournamentId: inv.raceId,
          tournamentName: inv.raceName,
          raceDate: inv.createdAt ? inv.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          raceTime: '15:00',
          prizePool: '10,000,000 VND',
          jockeyShare: inv.jockeySharePercent,
          ownerShare: inv.ownerSharePercent,
          status: inv.status === 'PENDING_JOCKEY' ? 'PENDING' : inv.status,
          notes: `Được mời làm kỵ sĩ cưỡi chiến mã ${inv.horseName} tham dự vòng đua ${inv.raceName}.`
        }));
        setInvitations(mappedInvs);
      } catch (err) {
        console.error('Failed to load invitations:', err);
      }

      // 5. Load Transactions
      try {
        const txs = await getTransactionHistoryAPI();
        setTransactions(txs);
      } catch (err) {
        console.error('Failed to load transaction history:', err);
      }

      // 6. Load Race History
      try {
        const historyData = await getJockeyHistoryAPI();
        const historyList = historyData.map(h => ({
          id: h.participantId || h.id,
          date: h.raceDate || h.date,
          tournament: h.raceName || h.tournament,
          raceRound: 'Vòng chung kết',
          horseName: h.horseName,
          ownerName: 'Chủ ngựa liên kết',
          placement: h.finalRank || h.placement,
          finishTime: h.finishTime ? (typeof h.finishTime === 'number' ? `${Math.floor(h.finishTime / 60)}m ${h.finishTime % 60}s` : h.finishTime) : 'N/A',
          prizeMoney: h.prizeMoney,
          payout: h.prizeMoney,
          sharePercent: 30
        }));
        setRaceHistory(historyList);
        localStorage.setItem('jockey_race_history', JSON.stringify(historyList));
      } catch (err) {
        console.error('Failed to load race history:', err);
      }

      // 7. Load Leaderboard
      try {
        const leaderboardData = await getJockeyLeaderboardAPI();
        const lbList = leaderboardData.map((l, index) => ({
          rank: l.rank || index + 1,
          fullName: l.jockeyName || l.fullName,
          winRate: l.winRate,
          rankingScore: l.rankingScore,
          experienceYears: l.experienceYear || l.experienceYears,
          isCurrentUser: l.jockeyId === mergedProfile.id || l.jockeyName === mergedProfile.fullName,
          avatar: l.avatarUrl || l.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        }));
        setLeaderboard(lbList);
        localStorage.setItem('jockey_leaderboard', JSON.stringify(lbList));
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      }

      // 8. Load Schedule
      try {
        const scheduleData = await getJockeyScheduleAPI();
        const scheduleList = scheduleData.map(s => ({
          id: s.participantId || s.id,
          ownerName: s.ownerName || 'Chủ ngựa liên kết',
          stableName: s.stableName || 'Stable',
          horseName: s.horseName,
          horseBreed: s.horseBreed || 'Thoroughbred',
          tournamentName: s.raceName || s.tournamentName,
          raceDate: s.raceDate,
          raceTime: s.startTime || s.raceTime,
          prizePool: s.prizePool || 'Tiền thưởng giải',
          jockeyShare: s.jockeyShare || 30,
          status: s.participantStatus || s.status || 'ACCEPTED',
          gateNumber: s.gateNumber
        }));
        setSchedule(scheduleList);
        localStorage.setItem('jockey_accepted_races', JSON.stringify(scheduleList));
      } catch (err) {
        console.error('Failed to load schedule:', err);
      }

    } catch (error) {
      console.error('Error in fetchJockeyData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJockeyData();
  }, []);

  const updateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('jockey_profile', JSON.stringify(updatedProfile));
    if (updatedProfile.walletBalance !== undefined) {
      localStorage.setItem('jockey_wallet_balance', updatedProfile.walletBalance.toString());
    }
  };

  const handleRespondToInvitation = async (invitationId, response) => {
    try {
      await respondToJockeyInvitationAPI(invitationId, response);
      
      const updatedInvs = invitations.map(inv => 
        inv.id === invitationId ? { ...inv, status: response } : inv
      );
      setInvitations(updatedInvs);
      
      // Reload schedule and other data
      await fetchJockeyData();
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
    }
  };

  const updateTransactions = (updater) => {
    setTransactions(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('jockey_transactions', JSON.stringify(next));
      return next;
    });
  };

  const updateRaceHistory = (updater) => {
    setRaceHistory(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('jockey_race_history', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    profile,
    setProfile: updateProfile,
    friends,
    invitations,
    tournaments,
    transactions,
    setTransactions: updateTransactions,
    raceHistory,
    setRaceHistory: updateRaceHistory,
    leaderboard,
    loading,
    refreshData: fetchJockeyData,
    respondToInvitation: handleRespondToInvitation,
    schedule: schedule
  };

  return (
    <JockeyContext.Provider value={value}>
      {children}
    </JockeyContext.Provider>
  );
}

export function useJockey() {
  const context = useContext(JockeyContext);
  if (!context) {
    throw new Error('useJockey must be used within a JockeyProvider');
  }
  return context;
}
