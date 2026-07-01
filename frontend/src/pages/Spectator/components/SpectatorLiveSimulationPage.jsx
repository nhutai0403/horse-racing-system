import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI } from '../../../services/races';
import { placeBetAPI, getMyBetsAPI } from '../../../services/bets';
import { getWalletBalanceAPI } from '../../../services/wallet';
import { AuthContext } from '../../../contexts/AuthContext';
import SpectatorLiveSimulation from './SpectatorLiveSimulation';
import '../Spectator.css';

export default function SpectatorLiveSimulationPage() {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  // Expanded states
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [racesMap, setRacesMap] = useState({}); // { tournamentId: [races] }
  const [loadingRaces, setLoadingRaces] = useState({});

  const [selectedRace, setSelectedRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Betting states
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPhotoFinishModal, setShowPhotoFinishModal] = useState(false);
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

  const handleTournamentClick = async (tId) => {
    setExpandedTournament(tId);
    
    // Check if races are already fetched
    if (racesMap[tId] && racesMap[tId].length > 0) {
      handleRaceClick(racesMap[tId][0]);
      return;
    }

    setLoadingRaces(prev => ({ ...prev, [tId]: true }));
    try {
      const racesData = await getTournamentRacesAPI(tId);
      setRacesMap(prev => ({ ...prev, [tId]: racesData || [] }));
      
      if (racesData && racesData.length > 0) {
        handleRaceClick(racesData[0]);
      } else {
        setSelectedRace(null);
      }
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
      case 'UPCOMING': return 'Sắp mở cược';
      case 'OPEN_FOR_REGISTER': return 'Đang mở cược';
      case 'CLOSED_FOR_REGISTER': return 'Đóng cược';
      case 'ACTIVE': return 'Đóng cược';
      case 'FINISHED': return 'Đã trả thưởng';
      default: return status || 'Không rõ';
    }
  };

  // Filter bets for the selected race
  const currentRaceBets = selectedRace
    ? myBets.filter(b => b.raceId === selectedRace.id || b.raceId === parseInt(selectedRace.id))
    : [];

  const isBettingClosed = !selectedRace || (() => {
    const t = tournaments.find(x => x.id === expandedTournament);
    return t?.tournamentStatus !== 'OPEN_FOR_REGISTER';
  })();

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
          <h2 className="fs-3 fw-bold text-dark mb-1">Trực Tiếp & Đặt Cược</h2>
          <p className="text-secondary small m-0">Theo dõi vòng đua và tham gia đặt cược theo thời gian thực.</p>
        </div>
        
        {/* Wallet balance pill */}
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border border-warning-subtle">
          <span className="material-symbols-outlined text-warning" style={{ fontSize: '20px' }}>account_balance_wallet</span>
          <div>
            <span className="text-secondary d-block" style={{ fontSize: '10px', lineHeight: 1 }}>Số dư khả dụng</span>
            <strong className="text-success small">{walletBalance.toLocaleString('vi-VN')} VNĐ</strong>
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* Left Column: Tournaments and Races lists */}
        <div className="col-12 col-lg-7">
          <div className="glass-card h-100 d-flex flex-column mb-0">
            
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

              <div className="dropdown" style={{ width: '200px', position: 'relative' }}>
                <button 
                  className="btn bg-white w-100 d-flex justify-content-between align-items-center shadow-sm" 
                  type="button" 
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  style={{ borderRadius: '20px', border: '1px solid #e0e0e0', padding: '8px 16px', color: '#495057', fontSize: '14px' }}
                >
                  <span className="text-truncate text-start fw-medium d-flex align-items-center gap-2" style={{flex: 1}}>
                    {statusFilter === '' && 'Tất cả trạng thái'}
                    {statusFilter === 'UPCOMING' && <><span className="d-inline-block rounded-circle bg-warning" style={{width:'8px',height:'8px'}}></span> Sắp mở cược</>}
                    {statusFilter === 'OPEN_FOR_REGISTER' && <><span className="d-inline-block rounded-circle bg-success" style={{width:'8px',height:'8px'}}></span> Đang mở cược</>}
                    {statusFilter === 'ACTIVE' && <><span className="d-inline-block rounded-circle bg-danger" style={{width:'8px',height:'8px'}}></span> Đóng cược</>}
                    {statusFilter === 'FINISHED' && <><span className="d-inline-block rounded-circle bg-secondary" style={{width:'8px',height:'8px'}}></span> Đã trả thưởng</>}
                  </span>
                  <span className="material-symbols-outlined text-muted" style={{fontSize: '20px'}}>expand_more</span>
                </button>
                {isStatusDropdownOpen && (
                  <>
                    <div className="position-fixed top-0 bottom-0 start-0 end-0" style={{zIndex: 99}} onClick={() => setIsStatusDropdownOpen(false)}></div>
                    <ul className="dropdown-menu w-100 shadow border-0 mt-2 p-2 show" style={{ borderRadius: '12px', fontSize: '14px', position: 'absolute', zIndex: 100 }}>
                      <li>
                        <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 ${statusFilter === '' ? 'bg-light text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter(''); setIsStatusDropdownOpen(false); }}>
                          <span className="d-inline-block rounded-circle me-2" style={{width:'8px',height:'8px'}}></span>
                          Tất cả trạng thái
                        </button>
                      </li>
                      <li>
                        <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 ${statusFilter === 'UPCOMING' ? 'bg-light text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('UPCOMING'); setIsStatusDropdownOpen(false); }}>
                          <span className="d-inline-block rounded-circle bg-warning me-2" style={{width:'8px',height:'8px'}}></span>
                          Sắp mở cược
                        </button>
                      </li>
                      <li>
                        <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 ${statusFilter === 'OPEN_FOR_REGISTER' ? 'bg-light text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('OPEN_FOR_REGISTER'); setIsStatusDropdownOpen(false); }}>
                          <span className="d-inline-block rounded-circle bg-success me-2" style={{width:'8px',height:'8px'}}></span>
                          Đang mở cược
                        </button>
                      </li>
                      <li>
                        <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 ${statusFilter === 'ACTIVE' ? 'bg-light text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('ACTIVE'); setIsStatusDropdownOpen(false); }}>
                          <span className="d-inline-block rounded-circle bg-danger me-2" style={{width:'8px',height:'8px'}}></span>
                          Đóng cược
                        </button>
                      </li>
                      <li>
                        <button className={`dropdown-item rounded d-flex align-items-center py-2 ${statusFilter === 'FINISHED' ? 'bg-light text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('FINISHED'); setIsStatusDropdownOpen(false); }}>
                          <span className="d-inline-block rounded-circle bg-secondary me-2" style={{width:'8px',height:'8px'}}></span>
                          Đã trả thưởng
                        </button>
                      </li>
                    </ul>
                  </>
                )}
              </div>
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
                          <tr className={`tournament-row-interactive ${isExpanded ? 'table-active border-primary' : ''}`} onClick={() => handleTournamentClick(t.id)}>
                            <td>
                              <strong className="text-dark block">{t.tournamentName}</strong>
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
                          
                          {/* Expanded races section removed, auto-selecting single race instead */}
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
                  {selectedRace.raceTrackName || 'Chi tiết giải đấu'}
                </h3>

                {/* Race Quick Info */}
                <div className="row g-2 mb-3 p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <div className="col-6">
                    <span className="small text-secondary me-1">Ngày đua:</span>
                    <span className="fw-bold text-dark small">{selectedRace.raceDate || 'Chưa định ngày'}</span>
                  </div>
                  <div className="col-6">
                    <span className="small text-secondary me-1">Giờ bắt đầu:</span>
                    <span className="fw-bold text-dark small">{selectedRace.startTime || selectedRace.raceTime || 'Chưa định giờ'}</span>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="small text-secondary me-1">Khoảng cách:</span>
                    <span className="fw-bold text-dark small">{selectedRace.distance}m</span>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="small text-secondary me-1">Bề mặt đường chạy:</span>
                    <span className="fw-bold text-dark small">{selectedRace.surfaceType || 'Turf'}</span>
                  </div>
                </div>

                {/* Simulation entry button for running/finished races */}
                {(selectedRace.status === 'RUNNING' || selectedRace.status === 'FINISHED') && (
                  <div className="mb-4 animate-bounce-subtle">
                    <button 
                      className="ho-btn ho-btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        if (selectedRace.status === 'FINISHED') {
                          setShowPhotoFinishModal(true);
                        } else {
                          setActiveSimulationRace(selectedRace);
                        }
                      }}
                    >
                      <span className="material-symbols-outlined">
                        {selectedRace.status === 'FINISHED' ? 'photo_camera' : 'analytics'}
                      </span>
                      {selectedRace.status === 'FINISHED' ? 'XEM ẢNH VỀ ĐÍCH (PHOTO FINISH)' : 'XEM MÔ PHỎNG TRỰC TIẾP (LIVE SIMULATION)'}
                    </button>
                  </div>
                )}

                {/* Participant list */}
                <h4 className="fs-6 fw-bold text-dark mb-2">Danh sách thi đấu</h4>
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
                          onClick={() => {
                            if (!canSelect) return;
                            if (selectedParticipant?.id === p.id) {
                              setSelectedParticipant(null);
                            } else {
                              setSelectedParticipant(p);
                            }
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div>
                              <strong className="text-dark me-2">{p.horseName}</strong>
                              <span className="text-secondary small" style={{ fontSize: '11px' }}>
                                Nài ngựa: {p.jockeyName}
                              </span>
                            </div>
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
                          <div className="d-flex flex-column gap-2 mt-1">
                            <div 
                              className={`p-2 border rounded d-flex justify-content-between align-items-center ${betType === 'WIN' ? 'border-success bg-success bg-opacity-10 shadow-sm' : 'border-secondary bg-white opacity-75'}`}
                              onClick={() => setBetType('WIN')}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              <div>
                                <span className="fw-bold text-dark d-block" style={{fontSize: '12px'}}>WIN (Chỉ Hạng 1)</span>
                                <span className="text-secondary d-block mt-1" style={{fontSize: '10px'}}>Rủi ro cao • Tiền thưởng lớn nhất</span>
                              </div>
                            </div>
                            <div 
                              className={`p-2 border rounded d-flex justify-content-between align-items-center ${betType === 'PLACE' ? 'border-success bg-success bg-opacity-10 shadow-sm' : 'border-secondary bg-white opacity-75'}`}
                              onClick={() => setBetType('PLACE')}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              <div>
                                <span className="fw-bold text-dark d-block" style={{fontSize: '12px'}}>PLACE (Hạng 1 hoặc 2)</span>
                                <span className="text-secondary d-block mt-1" style={{fontSize: '10px'}}>Rủi ro vừa • Tiền thưởng trung bình</span>
                              </div>
                            </div>
                            <div 
                              className={`p-2 border rounded d-flex justify-content-between align-items-center ${betType === 'SHOW' ? 'border-success bg-success bg-opacity-10 shadow-sm' : 'border-secondary bg-white opacity-75'}`}
                              onClick={() => setBetType('SHOW')}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              <div>
                                <span className="fw-bold text-dark d-block" style={{fontSize: '12px'}}>SHOW (Top 3)</span>
                                <span className="text-secondary d-block mt-1" style={{fontSize: '10px'}}>Rủi ro thấp • Dễ trúng nhất (tiền thưởng ít)</span>
                              </div>
                            </div>
                          </div>
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

      {/* Photo Finish Modal */}
      {showPhotoFinishModal && createPortal(
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content overflow-hidden" style={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
              <div className="modal-header border-0 position-absolute w-100 p-3" style={{ zIndex: 10 }}>
                <button 
                  type="button" 
                  className="btn-close btn-close-white ms-auto" 
                  onClick={() => setShowPhotoFinishModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0 position-relative">
                <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ minHeight: '400px', backgroundColor: '#000' }}>
                  <span className="material-symbols-outlined mb-3" style={{ fontSize: '48px', color: 'var(--ho-accent-gold)' }}>
                    photo_camera
                  </span>
                  <h4 className="fw-bold ho-font-epilogue" style={{ color: 'var(--ho-accent-gold)' }}>OFFICIAL PHOTO FINISH</h4>
                  <p className="text-secondary text-center px-4">Hình ảnh phân định thắng thua của giải đấu <strong>{selectedRace?.tournamentName}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
