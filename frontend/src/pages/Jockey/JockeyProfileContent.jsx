import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJockey } from './JockeyContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { updateJockeyProfileAPI } from '../../services/jockey';
import { depositAPI, withdrawAPI } from '../../services/wallet';

export default function JockeyProfileContent() {
  const navigate = useNavigate();
  const { profile, setProfile, transactions, setTransactions } = useJockey();
  const [activeSubTab, setActiveSubTab] = useState('edit-profile'); // 'edit-profile' | 'wallet'
  
  // Profile form state
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    phoneNumber: profile.phoneNumber || '',
    identityNumber: profile.identityNumber || '',
    dateOfBirth: profile.dateOfBirth || '',
    licenseNumber: profile.licenseNumber || '',
    height: profile.height || 165,
    weight: profile.weight || 54,
    experienceYears: profile.experienceYears || 0,
    matchesPlayed: profile.matchesPlayed || 0,
    bankAccount: profile.bankAccount || '',
    description: profile.description || ''
  });

  // Wallet actions state
  const [amount, setAmount] = useState('');
  
  // Format currency to VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("Vui lòng điền đầy đủ Họ và tên.");
      return;
    }

    try {
      const updated = await updateJockeyProfileAPI(formData);
      setProfile({
        ...profile,
        ...updated,
        experienceYears: updated.experienceYear || updated.experienceYears || profile.experienceYears,
        avatar: updated.avatarUrl || updated.avatar || profile.avatar
      });
      alert("Cập nhật hồ sơ kỵ sĩ thành công!");
    } catch (err) {
      alert("Cập nhật hồ sơ thất bại: " + err.message);
    }
  };

  const handleWalletAction = async (actionType) => {
    const numericAmt = parseFloat(amount);
    if (isNaN(numericAmt) || numericAmt <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    if (actionType === 'WITHDRAW' && numericAmt > profile.walletBalance) {
      alert("Số dư ví không đủ để thực hiện giao dịch rút tiền.");
      return;
    }

    try {
      if (actionType === 'DEPOSIT') {
        navigate('/payment-qr', { state: { amount: numericAmt, returnUrl: '/jockey/profile' } });
      } else {
        await withdrawAPI(numericAmt);
        setProfile(prev => ({
          ...prev,
          walletBalance: prev.walletBalance - numericAmt
        }));
        const newTx = {
          id: `TXJ_${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: 'WITHDRAWAL',
          event: `Yêu cầu rút tiền về tài khoản ngân hàng liên kết`,
          amount: -numericAmt
        };
        setTransactions(prev => [newTx, ...prev]);
        alert('Gửi yêu cầu rút tiền thành công, vui lòng chờ Admin duyệt!');
      }
      setAmount('');
    } catch (err) {
      alert('Giao dịch ví thất bại: ' + err.message);
    }
  };

  const transactionColumns = [
    {
      key: 'date',
      label: 'Thời gian',
      render: (item) => <span className="text-secondary small">{item.date}</span>
    },
    {
      key: 'event',
      label: 'Mô tả chi tiết',
      render: (item) => <span className="text-dark fw-medium small">{item.event}</span>
    },
    {
      key: 'type',
      label: 'Phân loại',
      render: (item) => <StatusBadge status={item.type} />
    },
    {
      key: 'amount',
      label: 'Giá trị (VND)',
      align: 'right',
      render: (item) => {
        const isPos = item.amount >= 0;
        return (
          <span className={`fw-bold ${isPos ? 'text-success' : 'text-danger'}`} style={{ fontSize: '13px' }}>
            {isPos ? '+' : ''}{formatVND(item.amount)}
          </span>
        );
      }
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Hồ sơ cá nhân & Ví thưởng
          </h2>
          <p className="text-secondary small m-0">
            Quản lý các thông số kỹ thuật của bạn và xem báo cáo tài chính từ giải đua.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          onClick={() => setActiveSubTab('edit-profile')}
          className={`ho-tab-btn ${activeSubTab === 'edit-profile' ? 'ho-tab-btn-active' : ''}`}
          style={{ borderRadius: '30px' }}
        >
          Thông tin kỵ sĩ
        </button>
        <button
          onClick={() => setActiveSubTab('wallet')}
          className={`ho-tab-btn ${activeSubTab === 'wallet' ? 'ho-tab-btn-active' : ''}`}
          style={{ borderRadius: '30px' }}
        >
          Ví tiền & Giao dịch
        </button>
      </div>

      {/* Grid Layout */}
      <div className="row g-4">
        {/* Left column - Avatar Card */}
        <div className="col-12 col-lg-4">
          <div className="glass-card text-center d-flex flex-column align-items-center justify-content-center h-100">
            <div className="rounded-circle overflow-hidden border shadow-sm mb-3" style={{ width: '120px', height: '120px', borderColor: 'var(--ho-accent-gold)', flexShrink: 0 }}>
              <img src={profile.avatar} alt={profile.fullName} className="w-100 h-100 object-fit-cover" />
            </div>
            <h3 className="fw-bold fs-5 mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
              {profile.fullName}
            </h3>
            <span className="ho-font-grotesk fw-bold text-uppercase text-secondary small mb-3" style={{ letterSpacing: '0.05em' }}>
              JOCKEY ROLE
            </span>
            <p className="text-secondary small px-3 mb-4" style={{ fontStyle: 'italic', lineHeight: '1.4' }}>
              "{profile.description}"
            </p>

            <div className="w-100 rounded p-3 text-start mb-0" style={{ backgroundColor: 'var(--ho-bg-cream)', border: '1px solid var(--ho-border-muted)' }}>
              <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <span className="fw-bold text-dark small">Kinh nghiệm:</span>
                <span className="text-secondary fw-semibold small">{profile.experienceYears} năm</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <span className="fw-bold text-dark small">Số trận đã tham gia:</span>
                <span className="text-secondary fw-semibold small">{profile.matchesPlayed || 0} trận</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <span className="fw-bold text-dark small">Email:</span>
                <span className="text-secondary fw-semibold small text-truncate ms-2" style={{ maxWidth: '180px' }} title={profile.email}>{profile.email}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="fw-bold text-dark small">Số điện thoại:</span>
                <span className="text-secondary fw-semibold small">{profile.phoneNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Main view details */}
        <div className="col-12 col-lg-8">
          {/* Subtab: Edit Profile Form */}
          {activeSubTab === 'edit-profile' && (
            <div className="glass-card h-100">
              <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
                Cập nhật thông tin chi tiết
              </h3>

              <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-3 text-dark">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Họ và tên</label>
                    <input
                      type="text"
                      className="ho-form-input text-dark"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Email (Liên kết)</label>
                    <input
                      type="email"
                      className="ho-form-input text-dark"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Số điện thoại</label>
                    <input
                      type="text"
                      className="ho-form-input text-dark"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Số CMND / CCCD</label>
                    <input
                      type="text"
                      className="ho-form-input text-dark"
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Ngày sinh</label>
                    <input
                      type="date"
                      className="ho-form-input text-dark"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Giấy phép nài ngựa (License)</label>
                    <input
                      type="text"
                      className="ho-form-input text-dark font-monospace"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Kinh nghiệm (Năm)</label>
                    <input
                      type="number"
                      className="ho-form-input text-dark"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="ho-input-label ho-font-grotesk">Số trận đã tham gia</label>
                    <input
                      type="number"
                      className="ho-form-input text-dark"
                      value={formData.matchesPlayed}
                      onChange={(e) => setFormData({ ...formData, matchesPlayed: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="ho-input-label ho-font-grotesk">Tài khoản ngân hàng liên kết nhận thưởng</label>
                  <input
                    type="text"
                    className="ho-form-input text-dark"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    placeholder="Nhập số tài khoản, ngân hàng và chi nhánh..."
                  />
                </div>

                <div>
                  <label className="ho-input-label ho-font-grotesk">Tiểu sử & Ghi chú kỹ năng</label>
                  <textarea
                    className="ho-form-input text-dark"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="text-end mt-2">
                  <button type="submit" className="ho-btn ho-btn-gold-solid py-2 px-5 fw-bold">
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subtab: Wallet & Financials Manager */}
          {activeSubTab === 'wallet' && (
            <div className="d-flex flex-column gap-4">
              {/* Balance & Actions Card */}
              <div className="glass-card" style={{ borderLeft: '4px solid var(--ho-accent-gold)' }}>
                <div className="row g-4 align-items-center">
                  <div className="col-12 col-md-5">
                    <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-1" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                      Số dư ví hiện tại
                    </h3>
                    <p className="ho-font-epilogue fs-2 fw-extrabold m-0 text-success">
                      {formatVND(profile.walletBalance)}
                    </p>
                  </div>
                  <div className="col-12 col-md-7 border-start border-light ps-md-4">
                    <label className="ho-input-label ho-font-grotesk">Nhập số tiền giao dịch (VND)</label>
                    <div className="d-flex gap-2">
                      <input
                        type="number"
                        placeholder="Ví dụ: 10,000,000"
                        className="ho-form-input text-dark fw-bold"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <button
                        onClick={() => handleWalletAction('DEPOSIT')}
                        className="ho-btn ho-btn-gold-solid py-2 px-3 fw-bold text-nowrap"
                        style={{ fontSize: '11px' }}
                      >
                        Nạp tiền
                      </button>
                      <button
                        onClick={() => handleWalletAction('WITHDRAW')}
                        className="ho-btn ho-btn-dark-green py-2 px-3 fw-bold text-nowrap"
                        style={{ fontSize: '11px' }}
                      >
                        Rút tiền
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Log */}
              <div className="glass-card">
                <h3 className="ho-font-epilogue fs-5 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
                  Lịch sử giao dịch ví thưởng
                </h3>
                <DataTable columns={transactionColumns} data={transactions} emptyMessage="Chưa phát sinh giao dịch nào." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
