import axiosClient from '../api/axiosClient';
import { initialJockeyProfile, initialJockeyInvitations } from '../pages/Jockey/mockData';

const isMockMode = () => {
  const override = localStorage.getItem('use_mock_api');
  if (override !== null) {
    return override === 'true';
  }
  return localStorage.getItem('backend_online') !== 'true';
};

export async function getJockeyProfileAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_profile');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('jockey_profile', JSON.stringify(initialJockeyProfile));
    return initialJockeyProfile;
  }

  try {
    const response = await axiosClient.get('/jockey/profile');
    return response.data; // JockeyProfileResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải hồ sơ kỵ sĩ.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateJockeyProfileAPI(profileData) {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_profile');
    const current = saved ? JSON.parse(saved) : initialJockeyProfile;
    const updated = { ...current, ...profileData };
    localStorage.setItem('jockey_profile', JSON.stringify(updated));
    return updated;
  }

  try {
    const response = await axiosClient.put('/jockey/profile', {
      fullName: profileData.fullName,
      phone: profileData.phoneNumber || profileData.phone,
      avatarUrl: profileData.avatar || profileData.avatarUrl,
      height: profileData.height,
      weight: profileData.weight,
      experienceYear: profileData.experienceYears || profileData.experienceYear,
      licenseNumber: profileData.licenseNumber,
      bankAccount: profileData.bankAccount,
    });
    return response.data; // JockeyProfileResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật hồ sơ kỵ sĩ.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyInvitationsAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_invitations');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('jockey_invitations', JSON.stringify(initialJockeyInvitations));
    return initialJockeyInvitations;
  }

  try {
    const response = await axiosClient.get('/jockey/invitations');
    return response.data; // List of RaceRegistrationResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách lời mời đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function respondToJockeyInvitationAPI(invitationId, action) {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_invitations') || '[]';
    const list = JSON.parse(saved);
    const updated = list.map(inv => 
      inv.id === invitationId ? { ...inv, status: action } : inv
    );
    localStorage.setItem('jockey_invitations', JSON.stringify(updated));

    if (action === 'ACCEPTED') {
      const acceptedInv = list.find(inv => inv.id === invitationId);
      if (acceptedInv) {
        const scheduleSaved = localStorage.getItem('jockey_accepted_races') || '[]';
        const scheduleList = JSON.parse(scheduleSaved);
        if (!scheduleList.some(s => s.id === invitationId)) {
          scheduleList.push({
            id: acceptedInv.id,
            ownerName: acceptedInv.ownerName,
            stableName: acceptedInv.stableName || 'Lucky Stable',
            horseName: acceptedInv.horseName,
            horseBreed: acceptedInv.horseBreed || 'Thoroughbred',
            raceName: acceptedInv.tournamentName,
            raceDate: acceptedInv.raceDate,
            startTime: acceptedInv.raceTime,
            prizePool: acceptedInv.prizePool,
            jockeyShare: acceptedInv.jockeyShare,
            gateNumber: 2,
            participantStatus: 'ACCEPTED'
          });
          localStorage.setItem('jockey_accepted_races', JSON.stringify(scheduleList));
        }
      }
    }

    window.dispatchEvent(new Event('jockey_invitations_updated'));
    return { success: true, invitationId, status: action };
  }

  try {
    const apiAction = action === 'ACCEPTED' ? 'ACCEPT' : action === 'REJECTED' ? 'REJECT' : action;
    const response = await axiosClient.put(`/jockey/invitations/${invitationId}/respond`, null, {
      params: { action: apiAction }
    });
    return response.data; // RaceRegistrationResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể gửi phản hồi lời mời đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyScheduleAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_accepted_races') || '[]';
    return JSON.parse(saved);
  }

  try {
    const response = await axiosClient.get('/jockey/schedule');
    return response.data; // List of JockeyScheduleResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải lịch thi đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyHistoryAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_race_history');
    if (saved) return JSON.parse(saved);
    const initialJockeyRaceHistory = [
      {
        id: "RHJ001",
        date: "2026-05-28",
        tournament: "Dai Nam Cup 2026",
        raceRound: "A-League Finals - 1200m",
        horseName: "Midnight Runner",
        ownerName: "Lam Hoang Kiet",
        placement: 1,
        finishTime: "1:09.45",
        prizeMoney: 150000000,
        payout: 45000000,
        sharePercent: 30
      },
      {
        id: "RHJ002",
        date: "2026-04-12",
        tournament: "Phu Tho Horse Racing Open",
        raceRound: "Qualifying Round 2 - 1400m",
        horseName: "Silver Cloud",
        ownerName: "Lam Hoang Kiet",
        placement: 3,
        finishTime: "1:25.12",
        prizeMoney: 30000000,
        payout: 9000000,
        sharePercent: 30
      }
    ];
    localStorage.setItem('jockey_race_history', JSON.stringify(initialJockeyRaceHistory));
    return initialJockeyRaceHistory;
  }

  try {
    const response = await axiosClient.get('/jockey/history');
    return response.data; // List of JockeyHistoryResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải lịch sử thi đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyLeaderboardAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_leaderboard');
    if (saved) return JSON.parse(saved);
    const initialJockeysLeaderboard = [
      { rank: 1, fullName: "Ryan Moore", winRate: 58, rankingScore: 1200, experienceYears: 8, isCurrentUser: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
      { rank: 2, fullName: "Lafitt Dettori", winRate: 65, rankingScore: 1150, experienceYears: 12, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
      { rank: 3, fullName: "Nguyen Van Hung", winRate: 40, rankingScore: 980, experienceYears: 4, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
      { rank: 4, fullName: "Le Minh Tuan", winRate: 45, rankingScore: 920, experienceYears: 6, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" },
      { rank: 5, fullName: "Tran Quoc Nam", winRate: 35, rankingScore: 810, experienceYears: 3, isCurrentUser: false, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" }
    ];
    localStorage.setItem('jockey_leaderboard', JSON.stringify(initialJockeysLeaderboard));
    return initialJockeysLeaderboard;
  }

  try {
    const response = await axiosClient.get('/jockey/leaderboard');
    return response.data; // List of JockeyLeaderboardResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải bảng xếp hạng kỵ sĩ.';
    throw new Error(errMsg, { cause: error });
  }
}
