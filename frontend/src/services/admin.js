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
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch referees.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getTracksAPI() {
  try {
    const response = await axiosClient.get('/admin/tracks');
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch tracks.';
    throw new Error(errMsg, { cause: error });
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

export async function confirmRaceRegistrationsAPI(tournamentId) {
  try {
    const response = await axiosClient.post(`/admin/tournaments/${tournamentId}/confirm-registration`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể chốt danh sách thi đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getWithdrawalsAPI() {
  try {
    const response = await axiosClient.get('/admin/wallets/withdrawals');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách yêu cầu rút tiền.';
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

export async function updateRaceStatusAPI(id, status) {
  try {
    const response = await axiosClient.put(`/admin/races/${id}/status`, { status });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật trạng thái vòng đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getPrizeDistributionsAPI(raceId) {
  try {
    const response = await axiosClient.get(`/admin/races/${raceId}/prize-distributions`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy thông tin trao giải.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getAdminDashboardStatsAPI() {
  try {
    const response = await axiosClient.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch dashboard stats.';
    throw new Error(errMsg, { cause: error });
  }
}
