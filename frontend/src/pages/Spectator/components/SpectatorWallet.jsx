import React, { useState, useEffect } from 'react';
import { getWalletBalanceAPI, depositAPI, withdrawAPI, getTransactionHistoryAPI } from '../../../services/wallet';
import '../Spectator.css';

export default function SpectatorWallet({ hideHeader = false }) {
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
      alert("Please enter a valid deposit amount.");
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
        alert("Failed to generate PayOS checkout link. Please try again.");
      }
    } catch (err) {
      alert(err.message || "Deposit transaction failed.");
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    if (e) e.preventDefault();
    const amountVal = parseFloat(withdrawAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (amountVal > balance) {
      alert("Insufficient balance for this withdrawal request.");
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawAPI(amountVal);
      alert("Withdrawal request submitted successfully. Please wait for Admin approval.");
      setWithdrawAmount('');
      // Refresh wallet & history
      await fetchWalletData();
      await fetchHistoryData();
    } catch (err) {
      alert(err.message || "Withdrawal transaction failed.");
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
      {!hideHeader && (
        <div className="mb-4">
          <span className="role-badge">SPECTATOR ROLE</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">My Wallet & Transactions</h2>
          <p className="text-secondary small">Manage your funds, make deposits via VietQR, or request cash withdrawals.</p>
        </div>
      )}

      <div className="row g-4">
        
        {/* Left Column: Wallet Balance & Forms */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          
          {/* Card Wallet Graphic */}
          <div className="wallet-premium-card">
            <div className="d-flex justify-content-between align-items-center">
              <span className="card-brand">EquineElite Member Wallet</span>
              <div className="card-chip"></div>
            </div>
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">
              {loading ? 'Loading...' : `${balance.toLocaleString('en-US')} VND`}
            </div>
            <div style={{ position: 'absolute', bottom: '15px', right: '20px', opacity: 0.15, fontSize: '48px' }}>
              💳
            </div>
          </div>

          {/* Form Tabs: Deposit & Withdraw */}
          <div className="glass-card flex-grow-1">
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
                  Deposit
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
                  Withdraw
                </button>
              </li>
            </ul>

            <div className="tab-content" id="pills-tabContent">
              
              {/* Deposit Panel */}
              <div className="tab-pane fade show active" id="pills-deposit" role="tabpanel" aria-labelledby="pills-deposit-tab">
                <form onSubmit={handleDepositSubmit} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="ho-input-label">Enter Deposit Amount (VND)</label>
                    <input 
                      type="number" 
                      min="10000" 
                      step="1000"
                      className="ho-form-input" 
                      placeholder="Example: 100000" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted small mt-1 block">Minimum deposit: 10,000 VND</small>
                  </div>

                  {/* Quick Options */}
                  <div>
                    <label className="ho-input-label">Quick Select Amount</label>
                    <div className="d-flex flex-wrap gap-2">
                      {[50000, 100000, 200000, 500000, 1000000].map(val => {
                        const isSelected = depositAmount === val.toString();
                        return (
                          <button 
                            key={val} 
                            type="button" 
                            onClick={() => selectQuickAmount(val)}
                            className={`btn btn-sm rounded-pill px-3 ${isSelected ? 'shadow-sm' : ''}`}
                            style={{ 
                              fontSize: '11.5px', 
                              fontWeight: '600',
                              backgroundColor: isSelected ? 'var(--ho-accent-gold)' : 'transparent',
                              color: isSelected ? '#fff' : 'var(--ho-accent-gold)',
                              border: '1px solid var(--ho-accent-gold)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {val.toLocaleString('en-US')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="ho-btn ho-btn-gold-solid w-100 mt-2 py-3"
                    disabled={depositing}
                  >
                    {depositing ? 'Generating checkout...' : 'Deposit via VietQR'}
                  </button>
                </form>
              </div>

              {/* Withdraw Panel */}
              <div className="tab-pane fade" id="pills-withdraw" role="tabpanel" aria-labelledby="pills-withdraw-tab">
                <form onSubmit={handleWithdrawSubmit} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="ho-input-label">Enter Withdrawal Amount (VND)</label>
                    <input 
                      type="number" 
                      min="20000" 
                      step="1000"
                      className="ho-form-input" 
                      placeholder="Example: 50000" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                    <small className="text-muted small mt-1 block">Minimum withdrawal: 20,000 VND</small>
                  </div>

                  <div className="p-3 rounded text-secondary small mb-2" style={{ background: '#f8f9fa', border: '1px solid #e2e8f0' }}>
                    <span className="fw-bold block text-dark mb-1">Withdrawal Processing Flow:</span>
                    Spectator submits request → Amount is temporarily frozen → Admin reviews and approves transaction → Cash/transfer completed externally.
                  </div>

                  <button 
                    type="submit" 
                    className="ho-btn ho-btn-gold-solid w-100 py-3"
                    disabled={withdrawing}
                  >
                    {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
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
              Transaction History
            </h3>

            {loadingHistory ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                <p className="text-secondary small mt-2">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-5 text-secondary small">No transaction history found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table ho-table">
                  <thead>
                    <tr>
                      <th>TXID</th>
                      <th>Date Created</th>
                      <th>Transaction Details</th>
                      <th>Amount</th>
                      <th>Status</th>
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
                            {isDeposit ? '+' : ''}{tx.amount.toLocaleString('en-US')} VND
                          </td>
                          <td>
                            <span className={`badge ${
                              tx.status === 'SUCCESS' ? 'bg-success' :
                              tx.status === 'PENDING' ? 'bg-warning text-dark' :
                              'bg-danger'
                            } text-uppercase small`} style={{ fontSize: '9px' }}>
                              {tx.status === 'SUCCESS' ? 'Success' :
                               tx.status === 'PENDING' ? 'Pending' : 'Failed'}
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
