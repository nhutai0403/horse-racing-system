import axiosClient from '../api/axiosClient';
import { initialJockeyTransactions } from '../pages/Jockey/mockData';

const isMockMode = () => {
  const override = localStorage.getItem('use_mock_api');
  return override === null ? true : override === 'true';
};

export async function getWalletBalanceAPI() {
  if (isMockMode()) {
    const saved = localStorage.getItem('jockey_wallet_balance');
    if (saved) return { balance: parseFloat(saved) };
    localStorage.setItem('jockey_wallet_balance', '450000000');
    return { balance: 450000000 };
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
    const savedBalance = localStorage.getItem('jockey_wallet_balance') || '450000000';
    const newBalance = parseFloat(savedBalance) + parseFloat(amount);
    localStorage.setItem('jockey_wallet_balance', newBalance.toString());

    // Thêm giao dịch vào lịch sử local
    const savedTx = localStorage.getItem('jockey_transactions') || '[]';
    const txList = JSON.parse(savedTx);
    txList.unshift({
      id: `TXJ_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'DEPOSIT',
      event: 'Nạp tiền vào ví từ tài khoản liên kết (Giả lập)',
      amount: parseFloat(amount)
    });
    localStorage.setItem('jockey_transactions', JSON.stringify(txList));

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
    const savedBalance = localStorage.getItem('jockey_wallet_balance') || '450000000';
    const newBalance = parseFloat(savedBalance) - parseFloat(amount);
    localStorage.setItem('jockey_wallet_balance', newBalance.toString());

    // Thêm giao dịch vào lịch sử local
    const savedTx = localStorage.getItem('jockey_transactions') || '[]';
    const txList = JSON.parse(savedTx);
    txList.unshift({
      id: `TXJ_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: 'WITHDRAWAL',
      event: 'Rút tiền về ngân hàng liên kết (Giả lập)',
      amount: -parseFloat(amount)
    });
    localStorage.setItem('jockey_transactions', JSON.stringify(txList));

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
    const saved = localStorage.getItem('jockey_transactions');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('jockey_transactions', JSON.stringify(initialJockeyTransactions));
    return initialJockeyTransactions;
  }

  try {
    const response = await axiosClient.get('/wallets/transactions');
    // Map dữ liệu của backend thành định dạng hiển thị của FE nếu cần
    return response.data.map(tx => ({
      id: tx.id.toString(),
      date: tx.createdAt ? tx.createdAt.replace('T', ' ').slice(0, 19) : '',
      type: tx.transactionType, // DEPOSIT or WITHDRAW
      event: tx.transactionType === 'DEPOSIT' 
        ? 'Nạp tiền vào ví' 
        : `Rút tiền về ngân hàng (${tx.status})`,
      amount: tx.transactionType === 'DEPOSIT' ? tx.amount : -tx.amount
    }));
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy lịch sử giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}
