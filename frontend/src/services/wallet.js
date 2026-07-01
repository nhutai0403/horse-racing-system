import axiosClient from '../api/axiosClient';
import { initialJockeyTransactions } from '../pages/Jockey/mockData';
import { initialTransactions } from '../pages/Horse-Owner/mockData';

const isMockMode = () => {
  return localStorage.getItem('backend_online') !== 'true';
};

const getUserRole = () => {
  const userStr = localStorage.getItem('horse_racing_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role; // 'HORSE_OWNER' or 'JOCKEY'
    } catch (e) {
      console.error('Lỗi parse user:', e);
    }
  }
  return 'JOCKEY';
};

const getWalletKey = () => {
  return getUserRole() === 'HORSE_OWNER' ? 'owner_wallet_balance' : 'jockey_wallet_balance';
};

const getTxKey = () => {
  return getUserRole() === 'HORSE_OWNER' ? 'owner_transactions' : 'jockey_transactions';
};

const getDefaultBalance = () => {
  return getUserRole() === 'HORSE_OWNER' ? 1250000000 : 450000000;
};

export async function getWalletBalanceAPI() {
  if (isMockMode()) {
    const key = getWalletKey();
    const saved = localStorage.getItem(key);
    if (saved) return { balance: parseFloat(saved) };
    const def = getDefaultBalance();
    localStorage.setItem(key, def.toString());
    return { balance: def };
  }

  try {
    const response = await axiosClient.get('/wallets/balance');
    return response.data; // Wallet entity: { id, balance, ... }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy số dư ví.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function depositAPI(amount) {
  if (isMockMode()) {
    const wKey = getWalletKey();
    const txKey = getTxKey();
    const defBal = getDefaultBalance();
    const savedBalance = localStorage.getItem(wKey) || defBal.toString();
    const newBalance = parseFloat(savedBalance) + parseFloat(amount);
    localStorage.setItem(wKey, newBalance.toString());

    // Thêm giao dịch vào lịch sử local
    const savedTx = localStorage.getItem(txKey) || '[]';
    const txList = JSON.parse(savedTx);
    txList.unshift({
      id: `TX_${getUserRole() === 'HORSE_OWNER' ? 'OWN' : 'JOC'}_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'DEPOSIT',
      event: 'Nạp tiền vào ví từ tài khoản liên kết (Giả lập)',
      amount: parseFloat(amount)
    });
    localStorage.setItem(txKey, JSON.stringify(txList));

    return { checkoutUrl: null, success: true };
  }

  try {
    const response = await axiosClient.post('/wallets/deposit', { amount });
    return response.data; // Trả về { checkoutUrl, orderCode, etc. }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Yêu cầu nạp tiền thất bại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function withdrawAPI(amount) {
  if (isMockMode()) {
    const wKey = getWalletKey();
    const txKey = getTxKey();
    const defBal = getDefaultBalance();
    const savedBalance = localStorage.getItem(wKey) || defBal.toString();
    const newBalance = parseFloat(savedBalance) - parseFloat(amount);
    localStorage.setItem(wKey, newBalance.toString());

    // Thêm giao dịch vào lịch sử local
    const savedTx = localStorage.getItem(txKey) || '[]';
    const txList = JSON.parse(savedTx);
    txList.unshift({
      id: `TX_${getUserRole() === 'HORSE_OWNER' ? 'OWN' : 'JOC'}_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'WITHDRAWAL',
      event: 'Rút tiền về ngân hàng liên kết (Giả lập)',
      amount: -parseFloat(amount)
    });
    localStorage.setItem(txKey, JSON.stringify(txList));

    return { success: true };
  }

  try {
    const response = await axiosClient.post('/wallets/withdraw', { amount });
    return response.data; // WalletTransaction
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Yêu cầu rút tiền thất bại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getTransactionHistoryAPI() {
  if (isMockMode()) {
    const txKey = getTxKey();
    const saved = localStorage.getItem(txKey);
    if (saved) return JSON.parse(saved);
    const defTxs = getUserRole() === 'HORSE_OWNER' ? initialTransactions : initialJockeyTransactions;
    localStorage.setItem(txKey, JSON.stringify(defTxs));
    return defTxs;
  }

  try {
    const response = await axiosClient.get('/wallets/transactions');
    return response.data.map(tx => {
      const isPositive = ['DEPOSIT', 'PRIZE', 'REFUND', 'WINNINGS'].includes(tx.transactionType);
      const mappedAmount = isPositive ? tx.amount : -tx.amount;
      
      let eventLabel = '';
      if (tx.transactionType === 'DEPOSIT') {
        eventLabel = 'Nạp tiền vào ví';
      } else if (tx.transactionType === 'WITHDRAW') {
        eventLabel = 'Rút tiền về ngân hàng';
      } else if (tx.transactionType === 'PRIZE' || tx.transactionType === 'WINNINGS') {
        eventLabel = 'Tiền thưởng thắng cuộc';
      } else if (tx.transactionType === 'ENTRY_FEE') {
        eventLabel = 'Lệ phí tham gia cuộc đua';
      } else if (tx.transactionType === 'REFUND') {
        eventLabel = 'Hoàn trả tiền';
      } else {
        eventLabel = `Giao dịch khác (${tx.transactionType})`;
      }

      if (tx.status === 'PENDING') {
        eventLabel += ' (Chờ thanh toán)';
      } else if (tx.status === 'FAILED') {
        eventLabel += ' (Thất bại)';
      } else if (tx.status === 'CANCELLED') {
        eventLabel += ' (Đã hủy)';
      }

      return {
        id: tx.id.toString(),
        date: tx.createdAt ? tx.createdAt.replace('T', ' ').slice(0, 19) : '',
        type: tx.transactionType, // Keep type for filtering calculations
        event: eventLabel,
        amount: mappedAmount,
        status: tx.status
      };
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy lịch sử giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function checkDepositStatusAPI(orderCode) {
  if (isMockMode()) {
    return { orderCode, status: 'SUCCESS' };
  }

  try {
    const response = await axiosClient.get(`/wallets/deposit/status/${orderCode}`);
    return response.data; // { orderCode, status }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể kiểm tra trạng thái giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}
