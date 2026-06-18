import axiosClient from '../api/axiosClient';

/**
 * Admin API services for managing role upgrades
 */

export async function getUpgradeRequestsAPI() {
  try {
    const response = await axiosClient.get('/admin/upgrade-requests');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch upgrade requests.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveUpgradeRequestAPI(requestId) {
  try {
    const response = await axiosClient.put(`/admin/upgrade-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to approve request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectUpgradeRequestAPI(requestId, rejectionReason) {
  try {
    const response = await axiosClient.put(`/admin/upgrade-requests/${requestId}/reject`, {
      rejectionReason: rejectionReason || 'Yêu cầu bị từ chối bởi Quản trị viên',
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reject request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRefereesAPI() {
  try {
    const response = await axiosClient.get('/admin/referees');
    const backendReferees = response.data || [];
    
    // Add pre-defined mock referees
    const mockReferees = [
      { id: 901, fullName: 'Trọng tài Nguyễn Văn An', email: 'referee.an@horseracing.com', username: 'referee_an', enabled: true },
      { id: 902, fullName: 'Trọng tài Trần Minh Đức', email: 'referee.duc@horseracing.com', username: 'referee_duc', enabled: true },
      { id: 903, fullName: 'Trọng tài Lê Hoàng Nam', email: 'referee.nam@horseracing.com', username: 'referee_nam', enabled: true }
    ];
    
    // Merge backend referees
    const combined = [...backendReferees];
    mockReferees.forEach(mock => {
      if (!combined.some(r => r.email === mock.email || r.id === mock.id)) {
        combined.push(mock);
      }
    });
    return combined;
  } catch (error) {
    console.warn('Backend referees API failed. Returning mock data.', error.message);
    return [
      { id: 901, fullName: 'Trọng tài Nguyễn Văn An', email: 'referee.an@horseracing.com', username: 'referee_an', enabled: true },
      { id: 902, fullName: 'Trọng tài Trần Minh Đức', email: 'referee.duc@horseracing.com', username: 'referee_duc', enabled: true },
      { id: 903, fullName: 'Trọng tài Lê Hoàng Nam', email: 'referee.nam@horseracing.com', username: 'referee_nam', enabled: true }
    ];
  }
}

export async function getTracksAPI() {
  try {
    const response = await axiosClient.get('/admin/tracks');
    const backendTracks = response.data || [];
    
    // Add pre-defined mock tracks
    const mockTracks = [
      { id: 801, name: 'Trường đua Phú Thọ', location: 'Quận 11, TP. Hồ Chí Minh' },
      { id: 802, name: 'Trường đua Đại Nam', location: 'Thủ Dầu Một, Bình Dương' },
      { id: 803, name: 'Trường đua Sóc Sơn', location: 'Hà Nội' }
    ];
    
    // Merge backend tracks
    const combined = [...backendTracks];
    mockTracks.forEach(mock => {
      if (!combined.some(t => t.name === mock.name || t.id === mock.id)) {
        combined.push(mock);
      }
    });
    return combined;
  } catch (error) {
    console.warn('Backend tracks API failed. Returning mock data.', error.message);
    return [
      { id: 801, name: 'Trường đua Phú Thọ', location: 'Quận 11, TP. Hồ Chí Minh' },
      { id: 802, name: 'Trường đua Đại Nam', location: 'Thủ Dầu Một, Bình Dương' },
      { id: 803, name: 'Trường đua Sóc Sơn', location: 'Hà Nội' }
    ];
  }
}

export async function createTournamentAPI(data) {
  try {
    const response = await axiosClient.post('/admin/tournaments', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tạo giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateTournamentAPI(id, data) {
  try {
    const response = await axiosClient.put(`/admin/tournaments/${id}`, data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateTournamentStatusAPI(id, status) {
  try {
    const response = await axiosClient.put(`/admin/tournaments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật trạng thái giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function deleteTournamentAPI(id) {
  try {
    const response = await axiosClient.delete(`/admin/tournaments/${id}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể xóa giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createRaceAPI(data) {
  try {
    const response = await axiosClient.post('/admin/races', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tạo vòng đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceRegistrationsAPI() {
  try {
    const response = await axiosClient.get('/admin/race-registrations');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách đăng ký đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveRaceRegistrationAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/race-registrations/${id}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể duyệt đơn đăng ký đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectRaceRegistrationAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/race-registrations/${id}/reject`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể từ chối đơn đăng ký đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function confirmRaceRegistrationsAPI(raceId) {
  try {
    const response = await axiosClient.post(`/admin/races/${raceId}/confirm-registration`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể chốt danh sách đăng ký đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveWithdrawalAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/wallets/transactions/${id}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể duyệt giao dịch rút tiền.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectWithdrawalAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/wallets/transactions/${id}/reject`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể từ chối giao dịch rút tiền.';
    throw new Error(errMsg, { cause: error });
  }
}
