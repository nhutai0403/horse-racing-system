import axiosClient from '../api/axiosClient';

/**
 * Public Tournaments & Races API Services with Mock Mode fallback
 */

const isMockMode = () => {
  return localStorage.getItem('backend_online') !== 'true';
};

export async function getTournamentsAPI() {
  if (isMockMode()) {
    return [
      { id: 1, tournamentName: "Spring Championship 2026", location: "Grand National Track", totalPrize: 5000000000, startDate: "2026-07-01", endDate: "2026-07-15", tournamentStatus: "UPCOMING" },
      { id: 2, tournamentName: "Royal Ascot Series 2026", location: "Ascot, Berkshire, UK", totalPrize: 8000000000, startDate: "2026-07-18", endDate: "2026-07-25", tournamentStatus: "OPEN_FOR_REGISTER" },
      { id: 3, tournamentName: "Binh Duong International Championship 2026", location: "Dai Nam Racecourse, Binh Duong", totalPrize: 5000000000, startDate: "2026-08-15", endDate: "2026-08-20", tournamentStatus: "ACTIVE" },
      { id: 4, tournamentName: "Winter Classic Cup 2025", location: "Sapa Snow Track, Vietnam", totalPrize: 4000000000, startDate: "2025-12-01", endDate: "2025-12-10", tournamentStatus: "FINISHED" }
    ];
  }

  try {
    const response = await axiosClient.get('/tournaments');
    return response.data; // List of TournamentResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getTournamentRacesAPI(tournamentId) {
  if (isMockMode()) {
    const tId = parseInt(tournamentId);
    if (tId === 1) {
      return [
        { id: 101, raceName: "Qualifier Round 1", raceDate: "2026-07-01", startTime: "14:00:00", surfaceType: "Turf", distance: 1200, status: "Upcoming", raceTrackName: "Grand National Track" }
      ];
    } else if (tId === 2) {
      return [
        { id: 201, raceName: "Gold Cup Stage 1", raceDate: "2026-07-18", startTime: "14:30:00", surfaceType: "Turf", distance: 1600, status: "OPEN_FOR_REGISTER", raceTrackName: "Ascot Turf Track" }
      ];
    } else if (tId === 3) {
      return [
        { id: 301, raceName: "Dai Nam Sprint Cup", raceDate: "2026-08-15", startTime: "09:00:00", surfaceType: "Dirt", distance: 1200, status: "ACTIVE", raceTrackName: "Dai Nam Oval Track" }
      ];
    } else if (tId === 4) {
      return [
        { id: 401, raceName: "Winter Classic Final", raceDate: "2025-12-05", startTime: "10:00:00", surfaceType: "Dirt", distance: 1600, status: "FINISHED", raceTrackName: "Sapa Snow Track" }
      ];
    }
    return [];
  }

  try {
    const response = await axiosClient.get(`/tournaments/${tournamentId}/races`);
    return response.data; // List of RaceResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách vòng đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceParticipantsAPI(raceId) {
  if (isMockMode()) {
    const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
    const localList = JSON.parse(savedLocal);
    
    // Find if the current user registered a horse for this race
    const userReg = localList.find(l => l.raceId === raceId || l.raceId === parseInt(raceId));
    if (userReg) {
      const horsesRaw = localStorage.getItem('owner_horses') || '[]';
      const horses = JSON.parse(horsesRaw);
      const horse = horses.find(h => h.name === userReg.horseName || h.id === userReg.horseId);
      
      const dirRaw = localStorage.getItem('mock_connections_directory') || '[]';
      const directory = JSON.parse(dirRaw);
      const jockey = directory.find(u => u.userId === userReg.jockeyId || u.id === userReg.jockeyId);

      return [
        { 
          id: Date.now(), 
          horseId: horse ? horse.id : 999, 
          horseName: userReg.horseName || (horse ? horse.name : 'Unknown'), 
          jockeyId: userReg.jockeyId || 1, 
          jockeyName: jockey ? jockey.fullName : "Ryan Moore", 
          ownerName: "Lam Hoang Kiet", 
          gateNumber: 1, 
          status: "READY" 
        }
      ];
    }
    
    // Return a dummy horse owned by another owner so the user can register theirs
    return [
      { id: 10001, horseId: 8880, horseName: "Silver Comet", jockeyId: 8881, jockeyName: "William Buick", ownerName: "Nguyen Van A", gateNumber: 1, status: "READY" },
      { id: 10002, horseId: 8881, horseName: "Golden Pegasus", jockeyId: 8882, jockeyName: "Lafitt Dettori", ownerName: "Tran The Anh", gateNumber: 3, status: "READY" },
      { id: 10003, horseId: 8882, horseName: "Midnight Thunder", jockeyId: 8883, jockeyName: "Ryan Moore", ownerName: "Le Thi B", gateNumber: 4, status: "READY" },
      { id: 10004, horseId: 8883, horseName: "Desert Storm", jockeyId: 8884, jockeyName: "Zac Purton", ownerName: "Pham Tuan C", gateNumber: 5, status: "READY" },
      { id: 10005, horseId: 8884, horseName: "Ocean Breeze", jockeyId: 8885, jockeyName: "Joao Moreira", ownerName: "Hoang Minh D", gateNumber: 8, status: "READY" }
    ];
  }

  try {
    const response = await axiosClient.get(`/races/${raceId}/participants`);
    return response.data; // List of ParticipantResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách người tham gia.';
    throw new Error(errMsg, { cause: error });
  }
}
