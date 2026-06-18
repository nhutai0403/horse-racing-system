import axiosClient from '../api/axiosClient';
import { initialJockeyDirectory } from '../pages/Jockey/mockData';

/**
 * Connections API services connecting to Spring Boot Backend with Mock Mode fallback
 */

const isMockMode = () => {
  const override = localStorage.getItem('use_mock_api');
  if (override !== null) {
    return override === 'true';
  }
  return localStorage.getItem('backend_online') !== 'true';
};

const getMockDirectory = () => {
  const dir = localStorage.getItem('mock_connections_directory');
  if (dir) {
    try {
      const parsed = JSON.parse(dir);
      const needsUpgrade = parsed.some(u => u.role === 'JOCKEY' && u.rankingScore === undefined);
      if (!needsUpgrade) {
        return parsed;
      }
    } catch (e) {
      // JSON parse error, proceed to reload
    }
  }
  localStorage.setItem('mock_connections_directory', JSON.stringify(initialJockeyDirectory));
  return initialJockeyDirectory;
};

const saveMockDirectory = (data) => {
  localStorage.setItem('mock_connections_directory', JSON.stringify(data));
  window.dispatchEvent(new Event('jockey_invitations_updated'));
};

export async function getConnectionsDirectoryAPI(query = '', role = 'ALL') {
  if (isMockMode()) {
    let dir = getMockDirectory();
    if (role !== 'ALL') {
      dir = dir.filter(u => u.role === role);
    }
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      dir = dir.filter(u => 
        u.fullName.toLowerCase().includes(q) || 
        (u.userId && u.userId.toString().includes(q)) ||
        (u.id && u.id.toString().includes(q))
      );
    }
    return dir;
  }

  try {
    const response = await axiosClient.get('/connections/directory', {
      params: { query, role }
    });
    return response.data; // List of ConnectionUserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch connections directory.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getFriendsAPI() {
  if (isMockMode()) {
    const dir = getMockDirectory();
    return dir.filter(u => u.friendStatus === 'FRIEND');
  }

  try {
    const response = await axiosClient.get('/connections/friends');
    return response.data; // List of ConnectionUserResponse (active friends)
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch friends.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function sendConnectionRequestAPI(recipientId) {
  if (isMockMode()) {
    const dir = getMockDirectory();
    const rId = parseInt(recipientId);
    const userIdx = dir.findIndex(u => u.userId === rId || u.id === rId);
    if (userIdx !== -1) {
      dir[userIdx].friendStatus = 'PENDING_SENT';
      saveMockDirectory(dir);
      return dir[userIdx];
    }
    throw new Error('User not found in directory');
  }

  try {
    const response = await axiosClient.post('/connections/request', null, {
      params: { recipientId }
    });
    return response.data; // ConnectionUserResponse of the new connection
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to send friend request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function respondToConnectionRequestAPI(connectionId, action) {
  if (isMockMode()) {
    const dir = getMockDirectory();
    const cId = parseInt(connectionId);
    const userIdx = dir.findIndex(u => u.connectionId === cId);
    if (userIdx !== -1) {
      dir[userIdx].friendStatus = action === 'ACCEPT' ? 'FRIEND' : 'NONE';
      saveMockDirectory(dir);
      return dir[userIdx];
    }
    throw new Error('Connection request not found');
  }

  try {
    const response = await axiosClient.put(`/connections/request/${connectionId}/respond`, null, {
      params: { action }
    });
    return response.data; // ConnectionUserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to respond to friend request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function deleteConnectionAPI(connectionId) {
  if (isMockMode()) {
    const dir = getMockDirectory();
    const cId = parseInt(connectionId);
    const userIdx = dir.findIndex(u => u.connectionId === cId);
    if (userIdx !== -1) {
      dir[userIdx].friendStatus = 'NONE';
      saveMockDirectory(dir);
      return { success: true };
    }
    throw new Error('Connection not found');
  }

  try {
    const response = await axiosClient.delete(`/connections/${connectionId}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to delete connection.';
    throw new Error(errMsg, { cause: error });
  }
}
