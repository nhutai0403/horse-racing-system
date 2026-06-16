import axiosClient from '../api/axiosClient';
import { initialOwnerProfile, initialHorses } from '../pages/Horse-Owner/mockData';

/**
 * Owner API Services with Mock Mode fallback
 */

const isMockMode = () => {
  return false; // Force mock mode for offline UI testing
};

export async function getOwnerProfileAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('owner_profile');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('owner_profile', JSON.stringify(initialOwnerProfile));
    return initialOwnerProfile;
  }

  try {
    const response = await axiosClient.get('/owner/profile');
    return response.data; // OwnerProfileResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy thông tin hồ sơ chủ ngựa.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateOwnerProfileAPI(profileData) {
  if (isMockMode()) {
    localStorage.setItem('owner_profile', JSON.stringify(profileData));
    return profileData;
  }

  try {
    const response = await axiosClient.put('/owner/profile', profileData);
    return response.data; // OwnerProfileResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật thông tin hồ sơ.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getMyHorsesAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('owner_horses');
    if (saved) return JSON.parse(saved);

    const mappedHorses = initialHorses.map(h => ({
      id: parseInt(h.id.replace('H', '') || '0'),
      name: h.name,
      breedName: h.breed,
      age: h.age,
      gender: h.gender,
      status: h.status,
      totalRaces: h.matchesPlayed,
      top1Rate: h.top1Rate,
      top2Rate: h.top2Rate,
      top3Rate: h.top3Rate,
      imageUrl: h.image
    }));
    localStorage.setItem('owner_horses', JSON.stringify(mappedHorses));
    return mappedHorses;
  }

  try {
    const response = await axiosClient.get('/owner/horses');
    return response.data; // List of HorseResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách ngựa.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createHorseAPI(horseData) {
  if (isMockMode()) {
    const saved = localStorage.getItem('owner_horses') || '[]';
    const list = JSON.parse(saved);
    const newHorse = {
      id: list.length + 100,
      name: horseData.name,
      breedName: horseData.breedName || 'Thoroughbred',
      age: horseData.age,
      gender: horseData.gender,
      status: 'READY',
      totalRaces: 0,
      top1Rate: 0,
      top2Rate: 0,
      top3Rate: 0,
      imageUrl: horseData.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&auto=format&fit=crop&q=60'
    };
    list.push(newHorse);
    localStorage.setItem('owner_horses', JSON.stringify(list));
    return newHorse;
  }

  try {
    const response = await axiosClient.post('/owner/horses', horseData);
    return response.data; // HorseResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể thêm ngựa mới.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function submitRaceRegistrationAPI(registrationData) {
  // Always bypass API and handle registration locally
  const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
  const localList = JSON.parse(savedLocal);
  localList.push({
    id: Date.now(),
    status: 'PENDING',
    ...registrationData
  });
  localStorage.setItem('owner_registered_races', JSON.stringify(localList));

  // Simulate sending an invitation to the registered Jockey!
  try {
    const dirRaw = localStorage.getItem('mock_connections_directory') || '[]';
    const directory = JSON.parse(dirRaw);
    const jockeyIdVal = parseInt(registrationData.jockeyId);
    const jockey = directory.find(u => u.userId === jockeyIdVal || u.id === jockeyIdVal);

    const horsesRaw = localStorage.getItem('owner_horses') || '[]';
    const horses = JSON.parse(horsesRaw);
    const horseIdVal = parseInt(registrationData.horseId);
    const horse = horses.find(h => h.id === horseIdVal);

    const ownerSaved = localStorage.getItem('owner_profile');
    const ownerProfile = ownerSaved ? JSON.parse(ownerSaved) : { fullName: 'Lam Hoang Kiet', stableName: 'Royal Stable' };

    let tName = `Tournament Race #${registrationData.raceId}`;

    const newInvitation = {
      id: `INV_${Date.now()}`,
      ownerId: ownerProfile.userId || ownerProfile.id || 999,
      ownerName: ownerProfile.fullName,
      stableName: ownerProfile.stableName || 'Royal Stable',
      horseName: horse ? horse.name : 'Unknown Horse',
      horseBreed: horse ? horse.breedName : 'Thoroughbred',
      tournamentId: registrationData.raceId,
      tournamentName: tName,
      raceDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      raceTime: '15:00',
      prizePool: '10,000,000 VND',
      jockeyShare: registrationData.jockeySharePercent || 10,
      ownerShare: registrationData.ownerSharePercent || 90,
      status: 'PENDING',
      notes: `Mời bạn làm nài ngựa điều khiển chiến mã ${horse ? horse.name : 'chiến mã'} tham gia giải đấu.`
    };

    const jockeyInvsRaw = localStorage.getItem('jockey_invitations') || '[]';
    const jockeyInvs = JSON.parse(jockeyInvsRaw);
    jockeyInvs.push(newInvitation);
    localStorage.setItem('jockey_invitations', JSON.stringify(jockeyInvs));
    
    // Dispatch window event to update Jockey header notifications immediately
    window.dispatchEvent(new Event('jockey_invitations_updated'));
  } catch (e) {
    console.error('Simulation of jockey invitation failed:', e);
  }

  return {
    id: Date.now(),
    status: 'PENDING',
    ...registrationData
  };
}

export async function uploadFilesAPI(files) {
  if (isMockMode()) {
    return Array.from(files).map(() => 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=500&auto=format&fit=crop&q=60');
  }

  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const response = await axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // List of file URLs
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải tệp lên.';
    throw new Error(errMsg, { cause: error });
  }
}
