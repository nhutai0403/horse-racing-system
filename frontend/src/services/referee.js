import axiosClient from '../api/axiosClient';

const isMockMode = () => {
  return localStorage.getItem('backend_online') !== 'true';
};

// LocalStorage Helper Keys
const COMPLETED_RACES_KEY = 'referee_completed_races';
const RACE_RESULTS_PREFIX = 'referee_race_results_';
const VIOLATIONS_KEY = 'referee_violations';
const INSPECTION_KEY = 'referee_inspection_horses';

// Helper to seed initial data
const seedInitialData = () => {
  if (!localStorage.getItem(COMPLETED_RACES_KEY)) {
    localStorage.setItem(COMPLETED_RACES_KEY, JSON.stringify([
      { id: 999, raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)', date: '2026-07-01', time: '14:00', status: 'FINISHED' }
    ]));
    localStorage.setItem(RACE_RESULTS_PREFIX + '999', JSON.stringify([
      { rank: 1, horseName: 'Thần Phong', jockeyName: 'Nguyễn Văn Đạt', time: '1m 20s' },
      { rank: 2, horseName: 'Xích Thố', jockeyName: 'Lê Hoàng Minh', time: '1m 22s' },
      { rank: 3, horseName: 'Bạch Long', jockeyName: 'Trần Văn Nam', time: '1m 25s' },
      { rank: 4, horseName: 'Hắc Báo', jockeyName: 'Phạm Quốc Bảo', time: '1m 28s' },
      { rank: 5, horseName: 'Tia Chớp', jockeyName: 'Huỳnh Gia Huy', time: '1m 32s' }
    ]));
  }

  const storedViolations = localStorage.getItem(VIOLATIONS_KEY);
  if (!storedViolations || !storedViolations.includes('raceName')) {
    localStorage.setItem(VIOLATIONS_KEY, JSON.stringify([
      { id: 1, date: '2026-07-01', raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)', horseName: 'Hắc Báo', jockeyName: 'Phạm Quốc Bảo', violationType: 'Illegal Blocking', status: 'FLAGGED' }
    ]));
  }

  if (!localStorage.getItem(INSPECTION_KEY)) {
    localStorage.setItem(INSPECTION_KEY, JSON.stringify([
      { id: 1, horseName: 'Thần Phong', breed: 'Thoroughbred', jockeyName: 'Nguyễn Văn Đạt', weight: 65, status: 'PENDING_INSPECTION', raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)' },
      { id: 2, horseName: 'Xích Thố', breed: 'Arabian', jockeyName: 'Lê Hoàng Minh', weight: 62, status: 'PENDING_INSPECTION', raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)' },
      { id: 3, horseName: 'Bạch Long', breed: 'Appaloosa', jockeyName: 'Trần Văn Nam', weight: 68, status: 'PENDING_INSPECTION', raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)' },
      { id: 4, horseName: 'Hắc Báo', breed: 'Quarter Horse', jockeyName: 'Phạm Quốc Bảo', weight: 64, status: 'PENDING_INSPECTION', raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)' },
      { id: 5, horseName: 'Tia Chớp', breed: 'Appaloosa', jockeyName: 'Huỳnh Gia Huy', weight: 63, status: 'PENDING_INSPECTION', raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)' }
    ]));
  }
};

// Seed immediately on import
seedInitialData();

export async function getRefereeDashboardStatsAPI() {
  if (isMockMode()) {
    seedInitialData();
    const races = JSON.parse(localStorage.getItem(COMPLETED_RACES_KEY)) || [];
    const horses = JSON.parse(localStorage.getItem(INSPECTION_KEY)) || [];
    const pendingHorses = horses.filter(h => h.status === 'PENDING_INSPECTION').length;
    const violations = JSON.parse(localStorage.getItem(VIOLATIONS_KEY)) || [];
    
    return {
      upcomingRaces: races.length,
      horsesToInspect: pendingHorses,
      violationsIssued: violations.length
    };
  }
  const response = await axiosClient.get('/referee/dashboard/stats');
  return response.data;
}

export async function getAssignedRacesAPI(status = '') {
  if (isMockMode()) {
    seedInitialData();
    return [
      { raceId: 999, raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)', raceDate: '2026-07-01', startTime: '14:00', status: 'Upcoming', distance: 1200 }
    ];
  }
  const response = await axiosClient.get(`/referee/races?status=${status}`);
  return response.data;
}

export async function getRacePreCheckAPI(raceId) {
  if (isMockMode()) {
    seedInitialData();
    const mockNames = ['Thần Phong', 'Xích Thố', 'Bạch Long', 'Hắc Báo', 'Tia Chớp'];
    const jockeys = ['Nguyễn Văn Đạt', 'Lê Hoàng Minh', 'Trần Văn Nam', 'Phạm Quốc Bảo', 'Huỳnh Gia Huy'];
    const mockParticipants = mockNames.map((name, idx) => ({
      participantId: idx + 1,
      horseId: 200 + idx,
      horseName: name,
      jockeyId: 300 + idx,
      jockeyName: jockeys[idx],
      ownerName: 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
      registeredWeight: 65,
      actualWeight: (60 + Math.random() * 10).toFixed(1),
      status: 'PENDING_INSPECTION'
    }));
    return {
      raceId: 999,
      raceName: 'Đua Mô Phỏng Thử Nghiệm (Demo Mode)',
      trackCondition: 'Good',
      weather: 'Sunny',
      participants: mockParticipants
    };
  }
  const response = await axiosClient.get(`/referee/races/${raceId}/pre-check`);
  return response.data;
}

export async function startRaceAPI(raceId) {
  if (isMockMode()) {
    return { success: true, message: 'Race simulation started (Mock Mode)' };
  }
  const response = await axiosClient.post(`/referee/races/${raceId}/start`);
  return response.data;
}

export async function getHorsesToInspectAPI() {
  if (isMockMode()) {
    seedInitialData();
    return JSON.parse(localStorage.getItem(INSPECTION_KEY)) || [];
  }
  const response = await axiosClient.get('/referee/inspect/horses');
  return response.data;
}

export async function updateHorseInspectionStatusAPI(id, newStatus, reason = '') {
  if (isMockMode()) {
    seedInitialData();
    const horses = JSON.parse(localStorage.getItem(INSPECTION_KEY)) || [];
    const updated = horses.map(h => h.id === id ? { ...h, status: newStatus, reason } : h);
    localStorage.setItem(INSPECTION_KEY, JSON.stringify(updated));
    return { id, status: newStatus, reason };
  }
  const response = await axiosClient.put(`/referee/inspect/horses/${id}`, { status: newStatus, reason });
  return response.data;
}

export async function getCompletedRacesAPI() {
  if (isMockMode()) {
    seedInitialData();
    return JSON.parse(localStorage.getItem(COMPLETED_RACES_KEY)) || [];
  }
  const response = await axiosClient.get('/referee/races?status=running');
  return response.data.map(race => ({
    ...race,
    id: race.raceId,
    date: race.raceDate,
    time: race.startTime
  }));
}

export async function getRaceResultsAPI(raceId) {
  if (isMockMode()) {
    seedInitialData();
    return JSON.parse(localStorage.getItem(RACE_RESULTS_PREFIX + raceId)) || [];
  }
  const response = await axiosClient.get(`/referee/races/${raceId}/results`);
  return response.data;
}

export async function confirmRaceResultsAPI(raceId) {
  if (isMockMode()) {
    seedInitialData();
    const races = JSON.parse(localStorage.getItem(COMPLETED_RACES_KEY)) || [];
    const filtered = races.filter(r => r.id !== raceId);
    localStorage.setItem(COMPLETED_RACES_KEY, JSON.stringify(filtered));
    return { success: true };
  }
  const response = await axiosClient.post(`/referee/races/${raceId}/confirm`);
  return response.data;
}

export async function getViolationsAPI() {
  if (isMockMode()) {
    seedInitialData();
    return JSON.parse(localStorage.getItem(VIOLATIONS_KEY)) || [];
  }
  const response = await axiosClient.get('/referee/violations');
  return response.data;
}

export async function reportViolationAPI(raceId, data) {
  if (isMockMode()) {
    seedInitialData();
    const violations = JSON.parse(localStorage.getItem(VIOLATIONS_KEY)) || [];
    const newViolation = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...data,
      status: data.isBlacklist ? 'BLACKLISTED' : 'FLAGGED'
    };
    violations.unshift(newViolation);
    localStorage.setItem(VIOLATIONS_KEY, JSON.stringify(violations));
    return newViolation;
  }
  const response = await axiosClient.post(`/referee/races/${raceId}/flags`, data);
  return response.data;
}

export async function saveSimulatedRaceAPI(race, results) {
  if (isMockMode()) {
    seedInitialData();
    const races = JSON.parse(localStorage.getItem(COMPLETED_RACES_KEY)) || [];
    races.unshift(race);
    localStorage.setItem(COMPLETED_RACES_KEY, JSON.stringify(races));
    localStorage.setItem(RACE_RESULTS_PREFIX + race.id, JSON.stringify(results));
    return { success: true };
  }
  return { success: true };
}
