import axiosClient from '../api/axiosClient';

/**
 * Public Tournaments & Races API Services with Mock Mode fallback
 */

const isMockMode = () => {
  const override = localStorage.getItem('use_mock_api');
  if (override !== null) {
    return override === 'true';
  }
  return localStorage.getItem('backend_online') !== 'true';
};

export async function getTournamentsAPI() {
  if (isMockMode()) {
    return [
      { id: 1, tournamentName: "Spring Championship 2026", location: "Grand National Track", totalPrize: 5000000000, start_date: "2026-07-01", end_date: "2026-07-15", tournament_status: "Upcoming" },
      { id: 2, tournamentName: "Royal Ascot Series 2026", location: "Ascot, Berkshire, UK", totalPrize: 8000000000, start_date: "2026-07-18", end_date: "2026-07-25", tournament_status: "OPEN_FOR_REGISTER" },
      { id: 3, tournamentName: "Binh Duong International Championship 2026", location: "Dai Nam Racecourse, Binh Duong", totalPrize: 5000000000, start_date: "2026-08-15", end_date: "2026-08-20", tournament_status: "OPEN_FOR_REGISTER" }
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
        { id: 301, raceName: "Dai Nam Sprint Cup", raceDate: "2026-08-15", startTime: "09:00:00", surfaceType: "Dirt", distance: 1200, status: "OPEN_FOR_REGISTER", raceTrackName: "Dai Nam Oval Track" }
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
      { id: 10002, horseId: 8881, horseName: "Golden Pegasus", jockeyId: 8882, jockeyName: "Lafitt Dettori", ownerName: "Tran The Anh", gateNumber: 3, status: "READY" }
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
