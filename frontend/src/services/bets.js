import axiosClient from '../api/axiosClient';

const isMockMode = () => {
  return false;
};

/**
 * Đặt cược mới cho một cặp đấu (Spectator only)
 * @param {Object} data { raceId, participantId, amount, betType }
 */
export async function placeBetAPI(data) {
  if (isMockMode()) {
    console.log("Mock place bet:", data);
    return {
      id: Date.now(),
      userId: 17,
      raceId: data.raceId,
      participantId: data.participantId,
      amount: data.amount,
      odds: 1.0,
      status: "PENDING",
      betType: data.betType,
      payoutAmount: 0.0,
      createdAt: new Date().toISOString()
    };
  }

  try {
    const response = await axiosClient.post('/bets', data);
    return response.data; // BetResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Đặt cược thất bại. Vui lòng kiểm tra lại.';
    throw new Error(errMsg, { cause: error });
  }
}

/**
 * Lấy danh sách vé cược của Spectator đang đăng nhập
 */
export async function getMyBetsAPI() {
  if (isMockMode()) {
    return [];
  }

  try {
    const response = await axiosClient.get('/bets/my-bets');
    return response.data; // List of BetResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách vé cược.';
    throw new Error(errMsg, { cause: error });
  }
}
