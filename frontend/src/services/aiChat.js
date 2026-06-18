import axiosClient from '../api/axiosClient';

/**
 * AI Chat Service
 */

const isMockMode = () => {
  const override = localStorage.getItem('use_mock_api');
  if (override !== null) {
    return override === 'true';
  }
  return localStorage.getItem('backend_online') !== 'true';
};

export async function sendChatMessageAPI(message) {
  if (isMockMode()) {
    // Mock response with slight delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Đây là phản hồi giả lập từ AI cho tin nhắn: "${message}"`);
      }, 1000);
    });
  }

  try {
    const response = await axiosClient.post('/chat', { message });
    // Dựa vào AiChatController, có thể trả về plain string hoặc object
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn AI:', error);
    throw new Error(error.response?.data?.error || 'Không thể gửi tin nhắn.');
  }
}

export async function getChatHistoryAPI() {
  if (isMockMode()) {
    return [
      { sender: 'AI', message: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?', createdAt: new Date().toISOString() }
    ];
  }

  try {
    const response = await axiosClient.get('/chat/history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    // Nếu chưa đăng nhập (UNAUTHORIZED), ta có thể ném lỗi hoặc trả về mảng rỗng
    if (error.response?.status === 401) {
      throw new Error('Vui lòng đăng nhập để xem lịch sử trò chuyện.');
    }
    throw new Error(error.response?.data?.error || 'Không thể tải lịch sử chat.');
  }
}

export async function clearChatHistoryAPI() {
  if (isMockMode()) {
    return { message: 'Đã xóa lịch sử chat (mock).' };
  }

  try {
    const response = await axiosClient.delete('/chat/history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử chat:', error);
    throw new Error(error.response?.data?.error || 'Không thể xóa lịch sử chat.');
  }
}
