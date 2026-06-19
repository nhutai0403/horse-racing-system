import React, { useState, useEffect } from 'react';
import { getWalletBalanceAPI, depositAPI, withdrawAPI, getTransactionHistoryAPI } from '../../../services/wallet';
import '../Spectator.css';

export default function SpectatorWallet() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchWalletData = async () => {
    try {
      const res = await getWalletBalanceAPI();
      setBalance(res.balance);
    } catch (err) {
      console.error("Failed to load balance", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const txs = await getTransactionHistoryAPI();
      setHistory(txs || []);
    } catch (err) {
      console.error("Failed to load transaction history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchHistoryData();
  }, []);

  const handleDepositSubmit = async (e) => {
    if (e) e.preventDefault();
    const amountVal = parseFloat(depositAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Vui lòng nhập số tiền nạp hợp lệ.");
      return;
    }

    setDepositing(true);
    try {
      // Call backend deposit API
      const res = await depositAPI(amountVal);
      if (res && res.checkoutUrl) {
        // Redirect to PayOS checkout page
        window.location.href = res.checkoutUrl;
      } else {
        alert("Không thể sinh mã thanh toán PayOS. Vui lòng thử lại.");
      }
    } catch (err) {
      alert(err.message || "Giao dịch nạp tiền thất bại.");
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    if (e) e.preventDefault();
    const amountVal = parseFloat(withdrawAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Vui lòng nhập số tiền rút hợp lệ.");
      return;
    }

    if (amountVal > balance) {
      alert("Số dư khả dụng không đủ để thực hiện yêu cầu.");
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawAPI(amountVal);
      alert("Gửi yêu cầu rút tiền thành công. Vui lòng chờ quản trị viên phê duyệt.");
      setWithdrawAmount('');
      // Refresh wallet & history
      await fetchWalletData();
      await fetchHistoryData();
    } catch (err) {
      alert(err.message || "Giao dịch rút tiền thất bại.");
    } finally {
      setWithdrawing(false);
    }
  };

  const selectQuickAmount = (val) => {
    setDepositAmount(val.toString());
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Title */}
      <div className="mb-4">
        <span className="role-badge">SPECTATOR ROLE</span>
        <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Ví Cá Nhân & Giao Dịch</h2>
        <p className="text-secondary small">Quản lý tài chính, thực hiện nạp tiền qua VietQR hoặc tạo yêu cầu rút tiền mặt.</p>
      </div>

      <div className="row g-4">
        
        {/* Left Column: Wallet Balance & Forms */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          
          {/* Card Wallet Graphic */}
          <div className="wallet-premium-card">
            <div className="d-flex justify-content-between align-items-center">
              <span className="card-brand">EquineElite Member Wallet</span>
              <div className="card-chip"></div>
            </div>
            <div className="balance-label">Số dư hiện tại</div>
            <div className="balance-amount">
              {loading ? 'Đang tải...' : `${balance.toLocaleString('vi-VN')} VND`}
            </div>
            <div style={{ position: 'absolute', bottom: '15px', right: '20px', opacity: 0.15, fontSize: '48px' }}>
              💳
            </div>
          </div>

          {/* Form Tabs: Deposit & Withdraw */}
          <div className="glass-card">
            <ul className="nav nav-pills mb-4 d-flex gap-2" id="pills-tab" role="tablist">
              <li className="nav-item flex-grow-1" role="presentation">
                <button 
                  className="ho-tab-btn w-100 active" 
                  id="pills-deposit-tab" 
                  data-bs-toggle="pill" 
                  data-bs-target="#pills-deposit" 
                  type="button" 
                  role="tab" 
                  aria-controls="pills-deposit" 
                  aria-selected="true"
                >
                  Nạp tiền
                </button>
              </li>
              <li className="nav-item flex-grow-1" role="presentation">
                <button 
                  className="ho-tab-btn w-100" 
                  id="pills-withdraw-tab" 
                  data-bs-toggle="pill" 
                  data-bs-target="#pills-withdraw" 
                  type="button" 
                  role="tab" 
                  aria-controls="pills-withdraw" 
                  aria-selected="false"
                >
                  Rút tiền
                </button>
              </li>
            </ul>

            <div className="tab-content" id="pills-tabContent">
              
              {/* Deposit Panel */}
              <div className="tab-pane fade show active" id="pills-deposit" role="tabpanel" aria-labelledby="pills-deposit-tab">
                <form onSubmit={handleDepositSubmit} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="ho-input-label">Nhập số tiền nạp (VND)</label>
                    <input 
                      type="number" 
                      min="10000" 
                      step="1000"
                      className="ho-form-input" 
                      placeholder="Ví dụ: 100000" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted small mt-1 block">Nạp tối thiểu 10,000 VND</small>
                  </div>

                  {/* Quick Options */}
                  <div>
                    <label className="ho-input-label">Chọn nhanh số tiền</label>
                    <div className="d-flex flex-wrap gap-2">
                      {[50000, 100000, 200000, 500000, 1000000].map(val => (
                        <button 
                          key={val} 
                          type="button" 
                          onClick={() => selectQuickAmount(val)}
                          className="btn btn-sm btn-outline-success rounded-pill px-3"
                          style={{ fontSize: '11.5px', fontWeight: '600' }}
                        >
                          {val.toLocaleString('vi-VN')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="ho-btn ho-btn-gold-solid w-100 mt-2 py-3"
                    disabled={depositing}
                  >
                    {depositing ? 'Đang tạo liên kết...' : 'Nạp tiền qua VietQR'}
                  </button>
                </form>
              </div>

              {/* Withdraw Panel */}
              <div className="tab-pane fade" id="pills-withdraw" role="tabpanel" aria-labelledby="pills-withdraw-tab">
                <form onSubmit={handleWithdrawSubmit} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="ho-input-label">Nhập số tiền rút (VND)</label>
                    <input 
                      type="number" 
                      min="20000" 
                      step="1000"
                      className="ho-form-input" 
                      placeholder="Ví dụ: 50000" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted small mt-1 block">Rút tối thiểu 20,000 VND</small>
                  </div>

                  <div className="p-3 rounded text-secondary small mb-2" style={{ background: '#f8f9fa', border: '1px solid #e2e8f0' }}>
                    <span className="fw-bold block text-dark mb-1">Quy trình xử lý rút tiền:</span>
                    Khán giả tạo yêu cầu rút tiền mặt → Số tiền sẽ bị đóng băng tạm thời → Ban quản trị (Admin) kiểm tra thông tin và duyệt giao dịch → Nhận tiền mặt/chuyển khoản ngoài đời thực.
                  </div>

                  <button 
                    type="submit" 
                    className="ho-btn ho-btn-gold-solid w-100 py-3"
                    disabled={withdrawing}
                  >
                    {withdrawing ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Transaction History */}
        <div className="col-12 col-lg-7">
          <div className="glass-card h-100">
            <h3 className="form-section-title">
              <span className="material-symbols-outlined text-success">history</span>
              Lịch Sử Giao Dịch
            </h3>

            {loadingHistory ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                <p className="text-secondary small mt-2">Đang tải lịch sử...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-5 text-secondary small">Chưa phát sinh giao dịch nào.</div>
            ) : (
              <div className="table-responsive">
                <table className="table ho-table">
                  <thead>
                    <tr>
                      <th>Mã GD</th>
                      <th>Ngày Tạo</th>
                      <th>Chi Tiết Giao Dịch</th>
                      <th>Số Tiền</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(tx => {
                      const isDeposit = tx.type === 'DEPOSIT' || tx.amount > 0;
                      return (
                        <tr key={tx.id}>
                          <td><span className="text-secondary small font-monospace">#{tx.id}</span></td>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{tx.date}</td>
                          <td>{tx.event}</td>
                          <td className={`fw-bold ${isDeposit ? 'text-success' : 'text-danger'}`} style={{ whiteSpace: 'nowrap' }}>
                            {isDeposit ? '+' : ''}{tx.amount.toLocaleString('vi-VN')} đ
                          </td>
                          <td>
                            <span className={`badge ${
                              tx.status === 'SUCCESS' ? 'bg-success' :
                              tx.status === 'PENDING' ? 'bg-warning text-dark' :
                              'bg-danger'
                            } text-uppercase small`} style={{ fontSize: '9px' }}>
                              {tx.status === 'SUCCESS' ? 'Thành công' :
                               tx.status === 'PENDING' ? 'Chờ duyệt' : 'Thất bại'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
