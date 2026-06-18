import React, { useState, useEffect } from 'react';
import { getTournamentsAPI, getTournamentRacesAPI } from '../../../services/races';
import {
  getRefereesAPI,
  getTracksAPI,
  createRaceAPI,
  getRaceRegistrationsAPI,
  approveRaceRegistrationAPI,
  rejectRaceRegistrationAPI,
  confirmRaceRegistrationsAPI
} from '../../../services/admin';
import { FaPlus, FaCheck, FaTimes, FaFlagCheckered, FaCalendarAlt, FaClock, FaCloud, FaRoad, FaCheckCircle, FaUser, FaInfoCircle } from 'react-icons/fa';

export default function RacesPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [races, setRaces] = useState([]);
  const [referees, setReferees] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    raceName: '',
    tournamentId: '',
    raceTrackId: '',
    raceDate: '',
    startTime: '',
    endTime: '',
    raceRound: 1,
    maxHorses: 8,
    distance: 1200,
    surfaceType: 'Turf',
    weather: 'Sunny',
    refereeId: ''
  });

  // Active sub-tab inside Races Panel
  const [activeSubTab, setActiveSubTab] = useState('racesList'); // 'racesList' or 'registrations'

  // Fetch initial info
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [tList, rList, trackList] = await Promise.all([
          getTournamentsAPI(),
          getRefereesAPI(),
          getTracksAPI()
        ]);
        setTournaments(tList);
        setReferees(rList);
        setTracks(trackList);
        
        if (tList.length > 0) {
          setSelectedTournamentId(tList[0].id);
          setFormData(prev => ({ 
            ...prev, 
            tournamentId: tList[0].id,
            refereeId: rList.length > 0 ? rList[0].id : '',
            raceTrackId: trackList.length > 0 ? trackList[0].id : ''
          }));
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu khởi động.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Fetch races when tournament selection changes
  useEffect(() => {
    if (selectedTournamentId) {
      fetchRaces();
    }
  }, [selectedTournamentId]);

  const fetchRaces = async () => {
    try {
      const raceList = await getTournamentRacesAPI(selectedTournamentId);
      setRaces(raceList);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách vòng đua.');
    }
  };

  const fetchRegistrations = async () => {
    setLoadingReg(true);
    try {
      const regList = await getRaceRegistrationsAPI();
      setRegistrations(regList);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách đăng ký đua.');
    } finally {
      setLoadingReg(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'registrations') {
      fetchRegistrations();
    }
  }, [activeSubTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRaceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formattedData = {
      ...formData,
      tournamentId: parseInt(formData.tournamentId),
      raceTrackId: parseInt(formData.raceTrackId),
      refereeId: parseInt(formData.refereeId),
      raceRound: parseInt(formData.raceRound),
      maxHorses: parseInt(formData.maxHorses),
      distance: parseFloat(formData.distance),
      // Format time from "HH:MM" to "HH:MM:SS"
      startTime: formData.startTime ? `${formData.startTime}:00` : null,
      endTime: formData.endTime ? `${formData.endTime}:00` : null,
    };

    try {
      await createRaceAPI(formattedData);
      setSuccess('Tạo vòng đua mới thành công!');
      fetchRaces();
      setShowForm(false);
      setFormData(prev => ({
        ...prev,
        raceName: '',
        raceRound: prev.raceRound + 1
      }));
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo vòng đua.');
    }
  };

  // Confirm registrations for a race
  const handleConfirmRegistrations = async (raceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn chốt danh sách đua cho vòng này? Tất cả đăng ký ở trạng thái PENDING sẽ bị loại và hoàn trả lệ phí.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await confirmRaceRegistrationsAPI(raceId);
      setSuccess('Đã chốt danh sách đua thành công và hoàn trả lệ phí cho danh sách chờ!');
      fetchRaces();
    } catch (err) {
      setError(err.message || 'Lỗi khi chốt danh sách đua.');
    }
  };

  // Approve registration
  const handleApproveReg = async (regId) => {
    setError('');
    setSuccess('');
    try {
      await approveRaceRegistrationAPI(regId);
      setSuccess('Đã duyệt đơn đăng ký đua thành công!');
      fetchRegistrations();
    } catch (err) {
      setError(err.message || 'Lỗi khi duyệt đơn đăng ký.');
    }
  };

  // Reject registration
  const handleRejectReg = async (regId) => {
    setError('');
    setSuccess('');
    try {
      await rejectRaceRegistrationAPI(regId);
      setSuccess('Đã từ chối đơn đăng ký đua!');
      fetchRegistrations();
    } catch (err) {
      setError(err.message || 'Lỗi khi từ chối đơn đăng ký.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Sub Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ho-border-gold)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setActiveSubTab('racesList')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeSubTab === 'racesList' ? 'rgba(0, 56, 32, 0.08)' : 'transparent',
              color: activeSubTab === 'racesList' ? 'var(--ho-primary-dark)' : 'var(--ho-text-muted)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            Quản Lý Vòng Đua
          </button>
          <button
            onClick={() => setActiveSubTab('registrations')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeSubTab === 'registrations' ? 'rgba(0, 56, 32, 0.08)' : 'transparent',
              color: activeSubTab === 'registrations' ? 'var(--ho-primary-dark)' : 'var(--ho-text-muted)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
          >
            Duyệt Đăng Ký Đua
          </button>
        </div>

        {activeSubTab === 'racesList' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`btn ${showForm ? 'btn-outline-danger' : 'btn-success'} d-flex align-items-center gap-2 fw-bold`}
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            {showForm ? 'Đóng Form' : <><FaPlus /> Thêm Vòng Đua</>}
          </button>
        )}
      </div>

      {/* Message alerts */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> {success}
        </div>
      )}

      {/* Tab content 1: RACES LIST & MANAGEMENT */}
      {activeSubTab === 'racesList' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tournament Selector */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', border: '1px solid var(--ho-border-gold)' }}>
            <label className="ho-input-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Chọn giải đấu:</label>
            <select
              value={selectedTournamentId}
              onChange={(e) => {
                setSelectedTournamentId(e.target.value);
                setFormData(prev => ({ ...prev, tournamentId: e.target.value }));
              }}
              className="ho-form-input text-dark fw-bold"
              style={{ flex: 1, height: '42px' }}
            >
              <option value="">Chọn giải đấu...</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.tournamentName} ({t.tournamentStatus})</option>
              ))}
            </select>
          </div>

          {/* Form to Create Race */}
          {showForm && (
            <form onSubmit={handleCreateRaceSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--ho-border-gold)' }}>
              <h3 className="ho-font-epilogue fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)', borderBottom: '1px solid var(--ho-border-gold)', paddingBottom: '10px' }}>
                Tạo Vòng Đua Mới
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label className="ho-input-label">Tên vòng đua *</label>
                    <input
                      type="text"
                      name="raceName"
                      value={formData.raceName}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                      placeholder="Nhập tên vòng đua (VD: Vòng Loại 1)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="ho-input-label">Trường đua *</label>
                    <select
                      name="raceTrackId"
                      value={formData.raceTrackId}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                    >
                      <option value="">Chọn trường đua...</option>
                      {tracks.map(tr => (
                        <option key={tr.id} value={tr.id}>{tr.name} ({tr.location})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label className="ho-input-label">Giờ bắt đầu *</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="ho-form-input text-dark fw-semibold"
                      />
                    </div>
                    <div className="form-group">
                      <label className="ho-input-label">Giờ kết thúc *</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="ho-form-input text-dark fw-semibold"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="ho-input-label">Trọng tài phụ trách lượt đua *</label>
                    <select
                      name="refereeId"
                      value={formData.refereeId}
                      onChange={handleInputChange}
                      required
                      className="ho-form-input text-dark fw-semibold"
                    >
                      <option value="">Chọn trọng tài...</option>
                      {referees.map(r => (
                        <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label className="ho-input-label">Ngày đua *</label>
                      <input
                        type="date"
                        name="raceDate"
                        value={formData.raceDate}
                        onChange={handleInputChange}
                        required
                        className="ho-form-input text-dark fw-semibold"
                      />
                    </div>
                    <div className="form-group">
                      <label className="ho-input-label">Lượt đua (Round) *</label>
                      <input
                        type="number"
                        name="raceRound"
                        value={formData.raceRound}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="ho-form-input text-dark fw-semibold"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label className="ho-input-label">Cự ly đua (meters) *</label>
                      <input
                        type="number"
                        name="distance"
                        value={formData.distance}
                        onChange={handleInputChange}
                        required
                        min="100"
                        className="ho-form-input text-dark fw-semibold"
                      />
                    </div>
                    <div className="form-group">
                      <label className="ho-input-label">Số ngựa tối đa *</label>
                      <select
                        name="maxHorses"
                        value={formData.maxHorses}
                        onChange={handleInputChange}
                        required
                        className="ho-form-input text-dark fw-semibold"
                      >
                        <option value="7">7 chú ngựa</option>
                        <option value="8">8 chú ngựa</option>
                        <option value="12">12 chú ngựa</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label className="ho-input-label">Bề mặt đường đua</label>
                      <select
                        name="surfaceType"
                        value={formData.surfaceType}
                        onChange={handleInputChange}
                        className="ho-form-input text-dark fw-semibold"
                      >
                        <option value="Turf">Cỏ (Turf)</option>
                        <option value="Dirt">Cát/Đất (Dirt)</option>
                        <option value="Muddy">Bùn (Muddy)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="ho-input-label">Thời tiết dự báo</label>
                      <input
                        type="text"
                        name="weather"
                        value={formData.weather}
                        onChange={handleInputChange}
                        className="ho-form-input text-dark fw-semibold"
                        placeholder="Sunny, Rain, Windy..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--ho-border-gold)', paddingTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline-secondary btn-sm fw-bold"
                  style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '13px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', borderRadius: '8px', fontSize: '13px' }}
                >
                  Tạo Vòng Đua
                </button>
              </div>
            </form>
          )}

          {/* Races list of Selected Tournament */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
              Danh Sách Vòng Đua Của Giải Đấu
            </h4>
            
            {races.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '12px', color: 'var(--ho-text-muted)', fontSize: '14px' }}>
                Chưa có vòng đua nào được tạo cho giải đấu này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {races.map((r) => (
                  <div key={r.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center', padding: '20px 24px', border: '1px solid var(--ho-border-gold)' }}>
                    
                    {/* Left Column Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '18px', color: 'var(--ho-accent-gold-text)', display: 'flex', alignItems: 'center' }}><FaFlagCheckered /></span>
                        <h5 className="ho-font-epilogue fs-5 fw-bold text-dark mb-0">{r.raceName} (Round {r.raceRound})</h5>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          background: r.status === 'FINISHED' ? 'rgba(16, 185, 129, 0.15)' : r.status === 'RUNNING' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                          color: r.status === 'FINISHED' ? '#10b981' : r.status === 'RUNNING' ? '#3b82f6' : 'var(--ho-text-muted)',
                          border: '1px solid var(--ho-border-gold)'
                        }}>{r.status}</span>
                      </div>

                      {/* Race Details */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px 25px', fontSize: '13px', color: 'var(--ho-text-muted)', marginTop: '5px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt /> <strong className="text-dark">{r.raceDate}</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock /> <strong className="text-dark">{r.startTime ? r.startTime.substring(0,5) : ''} - {r.endTime ? r.endTime.substring(0,5) : ''}</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaRoad /> <strong className="text-dark">{r.distance}m ({r.surfaceType})</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCloud /> <strong className="text-dark">{r.weather}</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser /> Trọng tài ID: <strong className="text-dark">{r.refereeId || 'Mặc định'}</strong></span>
                        <span style={{ color: 'var(--ho-accent-gold-text)', fontWeight: '600' }}>Giới hạn: {r.maxHorses} ngựa</span>
                      </div>
                    </div>

                    {/* Right Column Action */}
                    <div>
                      {r.status === 'Upcoming' || r.status === 'OPEN_FOR_REGISTER' ? (
                        <button
                          onClick={() => handleConfirmRegistrations(r.id)}
                          className="btn btn-warning btn-sm d-flex align-items-center gap-2 fw-bold"
                          style={{ color: '#02140b', padding: '10px 16px', borderRadius: '8px' }}
                        >
                          <FaCheckCircle /> Chốt Lượt Đua
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--ho-text-muted)', fontStyle: 'italic' }}>Đã đóng / Đang chạy</span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab content 2: APPROVE / REJECT REGISTRATIONS */}
      {activeSubTab === 'registrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
            Danh Sách Đơn Đăng Ký Lượt Đua Đang Chờ Duyệt
          </h3>

          {loadingReg ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ho-text-muted)' }}>Đang tải danh sách đăng ký...</div>
          ) : registrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
              Không có đơn đăng ký đua nào trong hệ thống.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,56,32,0.04)' }}>
                    <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Mã đơn</th>
                    <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Vòng đua (ID)</th>
                    <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Ngựa đua</th>
                    <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Nài ngựa</th>
                    <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Lợi nhuận chia (Jockey / Owner)</th>
                    <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Trạng thái</th>
                    <th style={{ padding: '16px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--ho-border-muted)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 56, 32, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--ho-primary-dark)' }}>#{reg.id}</td>
                      <td style={{ padding: '16px', color: 'var(--ho-text-dark)', fontWeight: '500' }}>Race ID: {reg.raceId}</td>
                      <td style={{ padding: '16px', color: 'var(--ho-text-dark)', fontWeight: '600' }}>Horse ID: {reg.horseId}</td>
                      <td style={{ padding: '16px', color: 'var(--ho-text-dark)', fontWeight: '600' }}>Jockey ID: {reg.jockeyId}</td>
                      <td style={{ padding: '16px', color: 'var(--ho-text-muted)' }}>{reg.jockeySharePercent}% / {reg.ownerSharePercent}%</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: reg.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : reg.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                          color: reg.status === 'APPROVED' ? '#10b981' : reg.status === 'REJECTED' ? '#ef4444' : 'var(--ho-accent-gold-text)'
                        }}>
                          {reg.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          {reg.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleApproveReg(reg.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '6px',
                                  color: '#10b981',
                                  fontWeight: '600',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <FaCheck /> Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectReg(reg.id)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '6px',
                                  color: '#ef4444',
                                  fontWeight: '600',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <FaTimes /> Từ chối
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--ho-text-muted)', fontStyle: 'italic' }}>Không có hành động</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
