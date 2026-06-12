import axiosClient from '../api/axiosClient';

/**
 * Connections API services connecting to Spring Boot Backend
 */

export async function getConnectionsDirectoryAPI(query = '', role = 'ALL') {
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
  try {
    const response = await axiosClient.get('/connections/friends');
    return response.data; // List of ConnectionUserResponse (active friends)
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch friends.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function sendConnectionRequestAPI(recipientId) {
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
  try {
    const response = await axiosClient.delete(`/connections/${connectionId}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to delete connection.';
    throw new Error(errMsg, { cause: error });
  }
}
