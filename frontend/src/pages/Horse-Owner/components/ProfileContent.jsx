import React, { useState } from 'react';

const presetAvatars = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
];

export default function ProfileContent({ profile, setProfile, transactions, setTransactions, raceHistory }) {
  const [formData, setFormData] = useState({ ...profile });
  const [depositAmount, setDepositAmount] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(formData);
    alert("Stable profile saved successfully!");
  };

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid positive deposit amount.");
      return;
    }
    // Update balance
    const updatedBalance = profile.walletBalance + amt;
    setProfile(prev => ({ ...prev, walletBalance: updatedBalance }));

    // Add to transaction history
    const newTx = {
      id: `TX00${transactions.length + 1}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: "DEPOSIT",
      event: "Deposit from linked bank account (Mock)",
      amount: amt
    };
    setTransactions(prev => [newTx, ...prev]);
    setDepositAmount('');
    alert(`Mock Deposit of ${amt.toLocaleString()} VND successful!`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid positive withdrawal amount.");
      return;
    }
    if (amt > profile.walletBalance) {
      alert("Insufficient funds for withdrawal.");
      return;
    }
    // Update balance
    const updatedBalance = profile.walletBalance - amt;
    setProfile(prev => ({ ...prev, walletBalance: updatedBalance }));

    // Add to transaction history
    const newTx = {
      id: `TX00${transactions.length + 1}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: "WITHDRAWAL",
      event: "Withdrawal to linked bank account (Mock)",
      amount: -amt
    };
    setTransactions(prev => [newTx, ...prev]);
    setDepositAmount('');
    alert(`Mock Withdrawal of ${amt.toLocaleString()} VND successful!`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result,
          avatarZoom: 1,
          avatarOffsetX: 0,
          avatarOffsetY: 0
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    // Initial offset in pixels: percentage * 80px container size / 100
    const currentOffsetX = (formData.avatarOffsetX || 0) * 80 / 100;
    const currentOffsetY = (formData.avatarOffsetY || 0) * 80 / 100;
    setDragStart({
      x: e.clientX - currentOffsetX,
      y: e.clientY - currentOffsetY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    // Limit translation between -100% and 100%
    const pctX = (deltaX / 80) * 100;
    const pctY = (deltaY / 80) * 100;
    setFormData(prev => ({
      ...prev,
      avatarOffsetX: Math.max(-100, Math.min(100, pctX)),
      avatarOffsetY: Math.max(-100, Math.min(100, pctY))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="row g-4">
        {/* Left Column: Stable Profile Settings */}
        <div className="col-12 col-lg-6">
          <div className="glass-card d-flex flex-column h-100">
            <h2 className="ho-font-epilogue fs-4 fw-bold border-bottom pb-3 mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Stable Profile Settings
            </h2>
            <form onSubmit={handleSave} className="d-flex flex-column gap-3 flex-grow-1">
              {/* Profile Avatar Selection */}
              <div className="d-flex flex-column align-items-center gap-3 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--ho-border-muted)' }}>
                <div
                  className="position-relative animate-scale-up rounded-circle overflow-hidden border cursor-grab"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderColor: 'var(--ho-accent-gold)',
                    borderWidth: '2px',
                    backgroundColor: '#eae5e4'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={formData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                    alt="Avatar Preview"
                    className="w-100 h-100 object-fit-cover"
                    style={{
                      transform: `translate(${formData.avatarOffsetX || 0}%, ${formData.avatarOffsetY || 0}%) scale(${formData.avatarZoom || 1})`,
                      transformOrigin: 'center center',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                <div className="w-100">
                  <label className="ho-input-label ho-font-grotesk text-center d-block mb-2">
                    Choose Profile Avatar
                  </label>
                  
                  {/* Preset suggestions */}
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {presetAvatars.map((url, index) => (
                      <div
                        key={index}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          avatar: url,
                          avatarZoom: 1,
                          avatarOffsetX: 0,
                          avatarOffsetY: 0
                        }))}
                        className="rounded-circle overflow-hidden border cursor-pointer transition-all"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderColor: formData.avatar === url ? 'var(--ho-accent-gold)' : '#c0c9c0',
                          borderWidth: '2px',
                          transform: formData.avatar === url ? 'scale(1.15)' : 'none',
                          boxShadow: formData.avatar === url ? '0 0 8px rgba(212, 175, 55, 0.6)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img src={url} alt={`Preset ${index + 1}`} className="w-100 h-100 object-fit-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Local Computer Uploader */}
                  <div className="d-flex flex-column gap-2 align-items-center mb-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-upload').click()}
                      className="ho-btn ho-btn-gold-outline py-1.5 px-3 d-flex align-items-center gap-2"
                      style={{ fontSize: '11px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span>
                      Upload from Computer
                    </button>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="d-none"
                    />
                  </div>

                  {/* Zoom Slider */}
                  <div className="px-3 mb-2 w-100">
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>Zoom</span>
                      <span>{Math.round((formData.avatarZoom || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={formData.avatarZoom || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, avatarZoom: parseFloat(e.target.value) }))}
                      className="form-range"
                      style={{ accentColor: 'var(--ho-accent-gold)' }}
                    />
                    <small className="text-secondary d-block text-center mt-1" style={{ fontSize: '10px' }}>
                      Drag image above to reposition
                    </small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label ho-font-grotesk">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="ho-form-input text-dark"
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label ho-font-grotesk">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="ho-form-input text-dark"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="ho-form-input text-secondary"
                  style={{ cursor: 'not-allowed', backgroundColor: '#f1f5f9' }}
                />
                <span className="text-secondary mt-1 d-block" style={{ fontSize: '10px' }}>Email address cannot be changed (tied to login session).</span>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label ho-font-grotesk">
                    Identity Card / Passport
                  </label>
                  <input
                    type="text"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    className="ho-form-input text-dark"
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label ho-font-grotesk">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="ho-form-input text-dark"
                    required
                  />
                </div>
              </div>

              <div className="border-top pt-3 mt-3">
                <h3 className="ho-font-epilogue fs-6 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
                  Stable Details
                </h3>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="ho-input-label ho-font-grotesk">
                      Stable Name
                    </label>
                    <input
                      type="text"
                      value={formData.stableName}
                      onChange={(e) => setFormData({ ...formData, stableName: e.target.value })}
                      className="ho-form-input text-dark"
                      required
                    />
                  </div>
                  <div>
                    <label className="ho-input-label ho-font-grotesk">
                      Stable Address
                    </label>
                    <input
                      type="text"
                      value={formData.stableAddress}
                      onChange={(e) => setFormData({ ...formData, stableAddress: e.target.value })}
                      className="ho-form-input text-dark"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="ho-btn ho-btn-dark-green w-100 py-3 mt-3"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Wallet & Race Logs */}
        <div className="col-12 col-lg-6 d-flex flex-column gap-4">
          {/* Wallet Details */}
          <div className="glass-card">
            <h2 className="ho-font-epilogue fs-4 fw-bold border-bottom pb-3 mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
              Stable Wallet
            </h2>
            <div className="rounded-3 p-4 mb-4 d-flex flex-column" style={{ background: 'linear-gradient(135deg, var(--ho-primary-dark), var(--ho-primary-medium))' }}>
              <h3 className="ho-font-grotesk text-uppercase fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ho-primary-light)' }}>
                Available Balance
              </h3>
              <p className="ho-font-epilogue fs-2 fw-extrabold m-0" style={{ color: '#ffe088' }}>
                {profile.walletBalance.toLocaleString()} VND
              </p>
              <p className="text-secondary small m-0 mt-2 font-mono" style={{ fontSize: '10px', color: '#cbd5e1' }}>
                Linked Bank Account: **** **** **** 8891
              </p>
            </div>

            <div className="d-flex flex-column gap-3">
              <input
                type="number"
                placeholder="Enter amount (VND)..."
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="ho-form-input fw-bold"
              />
              <div className="d-flex gap-2 w-100">
                <button
                  onClick={handleDeposit}
                  className="ho-btn ho-btn-gold-solid flex-grow-1 py-2 px-4"
                >
                  Deposit
                </button>
                <button
                  onClick={handleWithdraw}
                  className="ho-btn ho-btn-gold-outline flex-grow-1 py-2 px-4"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Race Participation History */}
          <div className="glass-card">
            <h2 className="ho-font-epilogue fs-4 fw-bold border-bottom pb-3 mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
              Race History Logs
            </h2>
            <div className="d-flex flex-column gap-3 overflow-y-auto pr-2" style={{ maxHeight: '280px' }}>
              {raceHistory.map((race) => (
                <div
                  key={race.id}
                  className="p-3 border rounded small d-flex flex-column gap-2"
                  style={{ backgroundColor: 'var(--ho-bg-cream)', borderColor: 'var(--ho-border-muted)' }}
                >
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-1" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>{race.tournament}</span>
                    <span className="ho-font-grotesk fw-bold text-uppercase" style={{ color: 'var(--ho-accent-gold-text)', fontSize: '10px' }}>
                      {race.date}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Round Name:</span>
                    <span className="fw-semibold">{race.raceRound}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Horse / Jockey:</span>
                    <span className="fw-semibold">{race.horseName} ({race.jockeyName})</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Placement:</span>
                    <span className="fw-bold" style={{ color: race.placement === 1 ? 'var(--ho-accent-gold-text)' : 'var(--ho-primary-dark)' }}>
                      {race.placement === 1 ? '🥇 1st Place' : race.placement === 2 ? '🥈 2nd Place' : `🥉 ${race.placement}rd Place`}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Winnings:</span>
                    <span className="fw-bold text-success">+{race.prizeMoney.toLocaleString()} VND</span>
                  </div>
                  <div className="p-2 rounded text-secondary" style={{ backgroundColor: 'rgba(0,0,0,0.03)', fontSize: '11px' }}>
                    {race.revenueShare}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
