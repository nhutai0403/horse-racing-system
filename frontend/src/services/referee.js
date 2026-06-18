import axiosClient from '../api/axiosClient';

const isMockMode = () => {
  const override = localStorage.getItem('use_mock_api');
  if (override !== null) {
    return override === 'true';
  }
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
      { id: 101, raceName: 'Qualifier Round 1', date: '2026-07-01', time: '14:00', status: 'FINISHED' },
      { id: 102, raceName: 'Qualifier Round 2', date: '2026-07-01', time: '15:00', status: 'FINISHED' }
    ]));
    localStorage.setItem(RACE_RESULTS_PREFIX + '101', JSON.stringify([
      { rank: 1, horseName: 'Lightning Bolt', jockeyName: 'John Doe', time: '1m 20s' },
      { rank: 2, horseName: 'Desert Wind', jockeyName: 'Jane Smith', time: '1m 22s' },
      { rank: 3, horseName: 'Pegasus Gold', jockeyName: 'Mike Tyson', time: '1m 25s' },
    ]));
    localStorage.setItem(RACE_RESULTS_PREFIX + '102', JSON.stringify([
      { rank: 1, horseName: 'Midnight Star', jockeyName: 'Alex Lee', time: '1m 18s' },
      { rank: 2, horseName: 'Desert Wind', jockeyName: 'Jane Smith', time: '1m 21s' },
      { rank: 3, horseName: 'Stormbreaker', jockeyName: 'Alice Green', time: '1m 24s' },
    ]));
  }

  const storedViolations = localStorage.getItem(VIOLATIONS_KEY);
  if (!storedViolations || !storedViolations.includes('raceName')) {
    localStorage.setItem(VIOLATIONS_KEY, JSON.stringify([
      { id: 1, date: '2026-07-01', raceName: 'Qualifier Round 1', horseName: 'Stormbreaker', jockeyName: 'Alice Green', violationType: 'Weight Tampering', status: 'FLAGGED' },
      { id: 2, date: '2026-06-25', raceName: 'Qualifier Round 2', horseName: 'Shadowfax', jockeyName: 'Tom Hardy', violationType: 'Illegal Blocking', status: 'BLACKLISTED' }
    ]));
  }

  if (!localStorage.getItem(INSPECTION_KEY)) {
    localStorage.setItem(INSPECTION_KEY, JSON.stringify([
      { id: 1, horseName: 'Lightning Bolt', breed: 'Thoroughbred', jockeyName: 'John Doe', weight: 65, status: 'PENDING_INSPECTION', raceName: 'Qualifier Round 1' },
      { id: 2, horseName: 'Desert Wind', breed: 'Arabian', jockeyName: 'Jane Smith', weight: 62, status: 'PENDING_INSPECTION', raceName: 'Qualifier Round 1' },
      { id: 3, horseName: 'Midnight Star', breed: 'Appaloosa', jockeyName: 'Alex Lee', weight: 68, status: 'PENDING_INSPECTION', raceName: 'Qualifier Round 2' },
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
  const response = await axiosClient.get('/referee/races/completed');
  return response.data;
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

export async function reportViolationAPI(data) {
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
  const response = await axiosClient.post('/referee/violations', data);
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
