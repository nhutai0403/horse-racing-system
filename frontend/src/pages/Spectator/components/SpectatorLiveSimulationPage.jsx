import React, { useState, useEffect } from 'react';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI } from '../../../services/races';
import { placeBetAPI, getMyBetsAPI } from '../../../services/bets';
import { getWalletBalanceAPI } from '../../../services/wallet';
import SpectatorLiveSimulation from './SpectatorLiveSimulation';
import '../Spectator.css';

export default function SpectatorLiveSimulationPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Expanded states
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [racesMap, setRacesMap] = useState({}); // { tournamentId: [races] }
  const [loadingRaces, setLoadingRaces] = useState({});

  const [selectedRace, setSelectedRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Betting states
  const [walletBalance, setWalletBalance] = useState(0);
  const [myBets, setMyBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [betType, setBetType] = useState('WIN');
  const [betAmount, setBetAmount] = useState('');
  const [placingBet, setPlacingBet] = useState(false);

  // Live simulation states
  const [activeSimulationRace, setActiveSimulationRace] = useState(null);

  const loadWalletAndBets = async () => {
    try {
      const balanceRes = await getWalletBalanceAPI();
      setWalletBalance(balanceRes.balance || 0);

      setLoadingBets(true);
      const betsRes = await getMyBetsAPI();
      setMyBets(betsRes || []);
    } catch (err) {
      console.error("Failed to load wallet balance or bets", err);
    } finally {
      setLoadingBets(false);
    }
  };

  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await getTournamentsAPI();
        setTournaments(data || []);
      } catch (err) {
        console.error("Failed to load tournaments", err);
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
    loadWalletAndBets();
  }, []);

  const toggleTournament = async (tId) => {
    if (expandedTournament === tId) {
      setExpandedTournament(null);
      return;
    }

    setExpandedTournament(tId);
    
    // Check if races are already fetched
    if (racesMap[tId]) return;

    setLoadingRaces(prev => ({ ...prev, [tId]: true }));
    try {
      const racesData = await getTournamentRacesAPI(tId);
      setRacesMap(prev => ({ ...prev, [tId]: racesData || [] }));
    } catch (err) {
      console.error(`Failed to fetch races for tournament ${tId}`, err);
    } finally {
      setLoadingRaces(prev => ({ ...prev, [tId]: false }));
    }
  };

  const handleRaceClick = async (race) => {
    setSelectedRace(race);
    setSelectedParticipant(null);
    setBetAmount('');
    setLoadingParticipants(true);
    setParticipants([]);
    try {
      const partData = await getRaceParticipantsAPI(race.id);
      setParticipants(partData || []);
    } catch (err) {
      console.error(`Failed to fetch participants for race ${race.id}`, err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handlePlaceBet = async (e) => {
    if (e) e.preventDefault();
    if (!selectedParticipant) {
      alert("Vui lòng chọn ngựa và nài ngựa để đặt cược.");
      return;
    }
    const amountVal = parseFloat(betAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Vui lòng nhập số tiền đặt cược hợp lệ.");
      return;
    }

    if (amountVal > walletBalance) {
      alert("Số dư ví không đủ để đặt cược. Vui lòng nạp thêm tiền.");
      return;
    }

    setPlacingBet(true);
    try {
      await placeBetAPI({
        raceId: selectedRace.id,
        participantId: selectedParticipant.id,
        amount: amountVal,
        betType: betType
      });
      alert("Đặt cược thành công!");
      setBetAmount('');
      setSelectedParticipant(null);
      await loadWalletAndBets();
    } catch (err) {
      alert(err.message || "Đặt cược thất bại. Vui lòng thử lại.");
    } finally {
      setPlacingBet(false);
    }
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const nameMatch = t.tournamentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = !statusFilter || t.tournamentStatus === statusFilter;
    return nameMatch && statusMatch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'badge-training';
      case 'OPEN_FOR_REGISTER': return 'badge-ready';
      case 'ACTIVE': return 'bg-success text-white';
      case 'FINISHED': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  };

  const translateStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'Sắp diễn ra';
      case 'OPEN_FOR_REGISTER': return 'Mở đăng ký';
      case 'CLOSED_FOR_REGISTER': return 'Đóng đăng ký';
      case 'ACTIVE': return 'Đang diễn ra';
      case 'FINISHED': return 'Đã kết thúc';
      default: return status || 'Không rõ';
    }
  };

  // Filter bets for the selected race
  const currentRaceBets = selectedRace
    ? myBets.filter(b => b.raceId === selectedRace.id || b.raceId === parseInt(selectedRace.id))
    : [];

  const isBettingClosed = selectedRace && (
    selectedRace.status === 'RUNNING' || 
    selectedRace.status === 'FINISHED' || 
    selectedRace.status === 'CANCELLED'
  );

  // If active simulation is set, render the simulator directly
  if (activeSimulationRace) {
    return (
      <SpectatorLiveSimulation 
        race={activeSimulationRace} 
        onClose={() => {
          setActiveSimulationRace(null);
          // Refresh data on exit
          loadWalletAndBets();
        }} 
      />
    );
  }

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Title */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <span className="role-badge">SPECTATOR ROLE</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Mô Phỏng Trực Tiếp & Đặt Cược</h2>
          <p className="text-secondary small m-0">Xem trực tiếp mô phỏng giải đấu thời gian thực và đặt cược Pari-Mutuel cho các trận đấu.</p>
        </div>
        
        {/* Wallet balance pill */}
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border border-warning-subtle">
          <span className="material-symbols-outlined text-warning" style={{ fontSize: '20px' }}>account_balance_wallet</span>
          <div>
            <span className="text-secondary block" style={{ fontSize: '10px', lineHeight: 1 }}>Số dư khả dụng</span>
            <strong className="text-success small">{walletBalance.toLocaleString('vi-VN')} VNĐ</strong>
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* Left Column: Tournaments and Races lists */}
        <div className="col-12 col-lg-7">
          <div className="glass-card mb-4">
            
            {/* Search/Filter Toolbar */}
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
              <div className="header-search position-relative flex-grow-1" style={{ maxWidth: '350px' }}>
                <span className="material-symbols-outlined header-search-icon">search</span>
                <input 
                  type="text" 
                  className="header-search-input w-100" 
                  placeholder="Tìm tên giải đấu, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="form-select" 
                style={{ width: '180px', borderRadius: '20px', border: '1px solid #c0c9c0', paddingLeft: '15px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="OPEN_FOR_REGISTER">Mở đăng ký</option>
                <option value="ACTIVE">Đang diễn ra</option>
                <option value="FINISHED">Đã kết thúc</option>
              </select>
            </div>

            {/* Tournaments list */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="text-secondary mt-2 small">Đang tải danh sách giải đấu...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-5 text-secondary small">Không tìm thấy giải đấu nào phù hợp.</div>
            ) : (
              <div className="table-responsive">
                <table className="table ho-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}></th>
                      <th>Giải Đấu</th>
                      <th>Địa Điểm</th>
                      <th>Tổng Giải Thưởng</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTournaments.map(t => {
                      const isExpanded = expandedTournament === t.id;
                      return (
                        <React.Fragment key={t.id}>
                          <tr className="tournament-row-interactive" onClick={() => toggleTournament(t.id)}>
                            <td>
                              <span className="material-symbols-outlined">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                            </td>
                            <td>
                              <strong className="text-dark block">{t.tournamentName}</strong>
                              <span className="text-muted small block" style={{ fontSize: '11px' }}>
                                {t.startDate} đến {t.endDate}
                              </span>
                            </td>
                            <td>{t.location}</td>
                            <td className="fw-bold text-success">
                              {t.totalPrize ? `${(t.totalPrize / 1000000).toLocaleString('vi-VN')}M` : '0M'}
                            </td>
                            <td>
                              <span className={`badge-custom ${getStatusBadgeClass(t.tournamentStatus)}`}>
                                {translateStatus(t.tournamentStatus)}
                              </span>
                            </td>
                          </tr>
                          
                          {/* Expanded races section */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="5" className="p-4" style={{ backgroundColor: '#fcfbfb' }}>
                                <div className="ps-3 border-start border-3" style={{ borderColor: 'var(--ho-accent-gold)' }}>
                                  <h5 className="ho-font-epilogue fs-6 fw-bold text-dark mb-3">Danh sách vòng đua:</h5>
                                  
                                  {loadingRaces[t.id] ? (
                                    <div className="text-center py-3 text-secondary small">Đang tải vòng đua...</div>
                                  ) : !racesMap[t.id] || racesMap[t.id].length === 0 ? (
                                    <div className="text-muted small py-2">Chưa có vòng đua nào được tạo trong giải đấu này.</div>
                                  ) : (
                                    <div className="d-flex flex-column gap-2">
                                      {racesMap[t.id].map(r => {
                                        const isLive = r.status === 'RUNNING';
                                        return (
                                          <div 
                                            key={r.id}
                                            onClick={() => handleRaceClick(r)}
                                            className={`race-sub-card p-3 d-flex justify-content-between align-items-center cursor-pointer ${selectedRace?.id === r.id ? 'border-primary shadow-sm bg-white' : ''}`}
                                            style={{ cursor: 'pointer', border: '1px solid #e5e2e1', borderRadius: '10px' }}
                                          >
                                            <div>
                                              <div className="d-flex align-items-center gap-2">
                                                <strong className="text-dark">{r.raceName} (Vòng {r.raceRound || 1})</strong>
                                                {isLive && (
                                                  <span className="badge bg-danger animate-pulse text-white d-flex align-items-center gap-1" style={{ fontSize: '9px', padding: '2px 6px' }}>
                                                    <span className="pulse-dot bg-white"></span> LIVE
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-secondary small mt-1" style={{ fontSize: '11px' }}>
                                                Lịch chạy: {r.raceDate} lúc {r.startTime || r.raceTime || 'Chưa định giờ'} | Quãng đường: {r.distance}m
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                              <span className="badge bg-light text-dark small">{r.surfaceType || 'Grass'}</span>
                                              <span className={`badge ${isLive ? 'bg-danger text-white' : 'bg-info text-white'} text-uppercase small`} style={{ fontSize: '10px' }}>{r.status}</span>
                                              <span className="material-symbols-outlined text-secondary">arrow_forward_ios</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Selected Race details, participants, betting and simulation */}
        <div className="col-12 col-lg-5">
          <div className="glass-card h-100 d-flex flex-column" style={{ minHeight: '500px' }}>
            {selectedRace ? (
              <div className="animate-fade-in d-flex flex-column h-100">
                <h3 className="form-section-title">
                  <span className="material-symbols-outlined text-success">flag</span>
                  {selectedRace.raceName}
                </h3>

                {/* Race Quick Info */}
                <div className="row g-2 mb-3 p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <div className="col-6">
                    <span className="small text-secondary block">Trường đua:</span>
                    <span className="fw-bold text-dark small">{selectedRace.raceTrackName || 'Chưa rõ'}</span>
                  </div>
                  <div className="col-6">
                    <span className="small text-secondary block">Khoảng cách:</span>
                    <span className="fw-bold text-dark small">{selectedRace.distance}m</span>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="small text-secondary block">Trạng thái vòng đua:</span>
                    <span className={`fw-bold small text-uppercase ${selectedRace.status === 'RUNNING' ? 'text-danger animate-pulse' : 'text-info'}`}>
                      {selectedRace.status === 'RUNNING' ? '● Đang chạy (LIVE)' : selectedRace.status}
                    </span>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="small text-secondary block">Bề mặt đường chạy:</span>
                    <span className="fw-bold text-dark small">{selectedRace.surfaceType || 'Grass'}</span>
                  </div>
                </div>

                {/* Simulation entry button for running/finished races */}
                {(selectedRace.status === 'RUNNING' || selectedRace.status === 'FINISHED') && (
                  <div className="mb-4 animate-bounce-subtle">
                    <button 
                      className="ho-btn ho-btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setActiveSimulationRace(selectedRace)}
                    >
                      <span className="material-symbols-outlined animate-spin-slow">analytics</span>
                      {selectedRace.status === 'FINISHED' ? 'Xem Ảnh Về Đích (Photo Finish)' : 'XEM MÔ PHỎNG TRỰC TIẾP (LIVE SIMULATION)'}
                    </button>
                  </div>
                )}

                {/* Participant list */}
                <h4 className="ho-font-epilogue fs-6 fw-bold text-dark mb-2">Danh sách thi đấu</h4>
                <p className="text-muted block mb-3" style={{ fontSize: '11px' }}>
                  {isBettingClosed ? '❌ Cổng đặt cược đã đóng cho trận này.' : '👉 Chọn một nài ngựa dưới đây để tiến hành đặt cược:'}
                </p>

                {loadingParticipants ? (
                  <div className="text-center py-4 flex-grow-1">
                    <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                    <p className="text-secondary small mt-2">Đang tải danh sách ngựa đua...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-4 text-secondary small flex-grow-1">Chưa có ngựa đua nào được đăng ký tham gia vòng đua này.</div>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-4">
                    {participants.map(p => {
                      const isSelected = selectedParticipant?.id === p.id;
                      const canSelect = !isBettingClosed && p.status !== 'DISQUALIFIED';
                      return (
                        <div 
                          key={p.id} 
                          className={`p-3 rounded border d-flex align-items-center justify-content-between ${
                            isSelected ? 'bg-light border-warning-subtle shadow-sm' : 'bg-white'
                          } ${canSelect ? 'cursor-pointer hover-card' : ''}`}
                          style={{ 
                            borderColor: isSelected ? 'var(--ho-accent-gold)' : '#e5e2e1',
                            borderWidth: isSelected ? '2px' : '1px'
                          }}
                          onClick={() => canSelect && setSelectedParticipant(p)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center fw-bold rounded-circle text-white bg-dark" 
                                 style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                              {p.gateNumber || '#'}
                            </div>
                            <div>
                              <strong className="text-dark block">{p.horseName}</strong>
                              <span className="text-secondary small block" style={{ fontSize: '11px' }}>
                                Nài ngựa: {p.jockeyName}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className={`badge ${
                              p.status === 'READY' || p.status === 'FINISHED' ? 'bg-success' : 
                              p.status === 'DISQUALIFIED' ? 'bg-danger' : 
                              'bg-warning text-dark'
                            } text-uppercase small`} style={{ fontSize: '9px' }}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Betting Panel Form */}
                {selectedParticipant && !isBettingClosed && (
                  <div className="p-3 border rounded mb-4 animate-scale-up" style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', borderColor: 'var(--ho-accent-gold)' }}>
                    <h5 className="fw-bold text-dark fs-6 mb-3 d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined text-warning">local_atm</span>
                      Phiếu đặt cược Pari-Mutuel
                    </h5>
                    
                    <div className="mb-2 text-dark small">
                      Đặt cược cho ngựa: <strong className="text-success">{selectedParticipant.horseName}</strong>
                    </div>

                    <form onSubmit={handlePlaceBet}>
                      <div className="row g-2 mb-3">
                        <div className="col-12">
                          <label className="ho-input-label mb-1">Loại đặt cược</label>
                          <select 
                            className="form-select form-select-sm"
                            value={betType}
                            onChange={(e) => setBetType(e.target.value)}
                          >
                            <option value="WIN">WIN (Hạng 1)</option>
                            <option value="PLACE">PLACE (Hạng 1 hoặc Hạng 2)</option>
                            <option value="SHOW">SHOW (Top 3)</option>
                          </select>
                        </div>
                        
                        <div className="col-12 mt-2">
                          <label className="ho-input-label mb-1">Số tiền đặt cược (VNĐ)</label>
                          <input 
                            type="number"
                            min="1000"
                            step="1000"
                            className="form-control form-control-sm"
                            placeholder="Nhập số tiền đặt cược..."
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            required
                          />
                          {selectedRace.tournamentMinBet && (
                            <span className="text-muted block mt-1" style={{ fontSize: '9px' }}>
                              * Số tiền cược tối thiểu: {selectedRace.tournamentMinBet.toLocaleString('vi-VN')} VNĐ
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button 
                          type="button" 
                          className="ho-btn ho-btn-outline-secondary py-1 px-3 flex-grow-1 small"
                          onClick={() => setSelectedParticipant(null)}
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          type="submit" 
                          className="ho-btn ho-btn-gold-solid py-1 px-3 flex-grow-1 small"
                          disabled={placingBet || !betAmount}
                        >
                          {placingBet ? 'Đang gửi...' : 'Xác nhận Đặt cược'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Bets Placed In This Race logs list */}
                {currentRaceBets.length > 0 && (
                  <div className="mt-auto border-top pt-3">
                    <h5 className="fw-bold text-dark fs-6 mb-3 d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>receipt_long</span>
                      Vé cược của bạn trong trận này
                    </h5>
                    
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      {currentRaceBets.map(bet => (
                        <div key={bet.id} className="p-3 rounded border bg-light d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-dark small block">{bet.horseName}</strong>
                            <span className="text-secondary block mt-1" style={{ fontSize: '10px' }}>
                              Cửa: <strong className="text-success">{bet.betType}</strong> | Tiền cược: {bet.amount?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="text-end">
                            <span className={`badge ${
                              bet.status === 'WON' ? 'bg-success' :
                              bet.status === 'LOST' ? 'bg-danger' :
                              bet.status === 'REFUNDED' ? 'bg-secondary' :
                              'bg-warning text-dark'
                            } text-uppercase mb-1`} style={{ fontSize: '8px', display: 'block' }}>
                              {bet.status === 'WON' ? 'Thắng' : bet.status === 'LOST' ? 'Thua' : bet.status === 'REFUNDED' ? 'Hoàn tiền' : 'Đang chờ'}
                            </span>
                            {bet.status === 'WON' && (
                              <span className="text-success fw-bold block" style={{ fontSize: '10px' }}>
                                +{bet.payoutAmount?.toLocaleString('vi-VN')} VNĐ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center my-auto">
                <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>
                  info
                </span>
                <p className="text-secondary small">
                  Chọn một giải đấu bên trái, bấm vào vòng đua để xem thông tin chi tiết, đặt cược Pari-Mutuel và theo dõi mô phỏng.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
