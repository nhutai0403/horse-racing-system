import React, { useState, useEffect } from 'react';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI } from '../../../services/races';
import '../Spectator.css';

export default function SpectatorTournaments() {
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

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Title */}
      <div className="mb-4">
        <span className="role-badge">SPECTATOR ROLE</span>
        <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Giải Đấu & Vòng Đua</h2>
        <p className="text-secondary small">Tra cứu thông tin các giải đua đang diễn ra và danh sách ngựa tham chiến.</p>
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
                                {t.start_date} đến {t.end_date}
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
                                      {racesMap[t.id].map(r => (
                                        <div 
                                          key={r.id}
                                          onClick={() => handleRaceClick(r)}
                                          className={`race-sub-card p-3 d-flex justify-content-between align-items-center cursor-pointer ${selectedRace?.id === r.id ? 'border-primary' : ''}`}
                                          style={{ cursor: 'pointer', border: '1px solid #e5e2e1' }}
                                        >
                                          <div>
                                            <strong className="text-dark">{r.raceName} (Vòng {r.raceRound || 1})</strong>
                                            <div className="text-secondary small mt-1" style={{ fontSize: '11px' }}>
                                              Lịch chạy: {r.raceDate} lúc {r.startTime || r.raceTime || 'Chưa định giờ'} | Quãng đường: {r.distance}m
                                            </div>
                                          </div>
                                          <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-light text-dark small">{r.surfaceType || 'Turf'}</span>
                                            <span className="badge bg-info text-white text-uppercase small" style={{ fontSize: '10px' }}>{r.status}</span>
                                            <span className="material-symbols-outlined text-secondary">arrow_forward_ios</span>
                                          </div>
                                        </div>
                                      ))}
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

        {/* Right Column: Selected Race details and participants */}
        <div className="col-12 col-lg-5">
          <div className="glass-card h-100">
            {selectedRace ? (
              <div className="animate-fade-in">
                <h3 className="form-section-title">
                  <span className="material-symbols-outlined text-success">flag</span>
                  {selectedRace.raceName}
                </h3>

                {/* Race Quick Info */}
                <div className="row g-2 mb-4 p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <div className="col-6">
                    <span className="small text-secondary block">Trường đua:</span>
                    <span className="fw-bold text-dark small">{selectedRace.raceTrackName || 'Chưa rõ'}</span>
                  </div>
                  <div className="col-6">
                    <span className="small text-secondary block">Khoảng cách:</span>
                    <span className="fw-bold text-dark small">{selectedRace.distance}m</span>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="small text-secondary block">Thời tiết:</span>
                    <span className="fw-bold text-dark small">{selectedRace.weather || 'Không rõ'}</span>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="small text-secondary block">Bề mặt đường chạy:</span>
                    <span className="fw-bold text-dark small">{selectedRace.surfaceType || 'Turf'}</span>
                  </div>
                </div>

                {/* Participant list */}
                <h4 className="ho-font-epilogue fs-6 fw-bold text-dark mb-3">Danh sách thi đấu</h4>

                {loadingParticipants ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                    <p className="text-secondary small mt-2">Đang tải danh sách ngựa đua...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-4 text-secondary small">Chưa có ngựa đua nào được đăng ký tham gia vòng đua này.</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {participants.map(p => (
                      <div key={p.id} className="p-3 rounded border bg-white d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--ho-border-gold)' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center justify-content-center fw-bold rounded-circle text-white bg-dark" 
                               style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                            {p.gateNumber || '#'}
                          </div>
                          <div>
                            <strong className="text-dark block">{p.horseName}</strong>
                            <span className="text-secondary small block" style={{ fontSize: '11px' }}>
                              Nài ngựa: {p.jockeyName} | Chủ: {p.ownerName}
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
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>
                  info
                </span>
                <p className="text-secondary small">
                  Chọn một giải đấu bên trái, bấm vào vòng đua để xem thông tin chi tiết và danh sách các cặp ngựa thi đấu.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
