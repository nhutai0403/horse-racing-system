import React, { useState, useEffect } from 'react';
import { getTournamentsAPI } from '../../../services/races';
import {
  getRefereesAPI,
  createTournamentAPI,
  updateTournamentAPI,
  updateTournamentStatusAPI,
  deleteTournamentAPI
} from '../../../services/admin';
import { FaPlus, FaEdit, FaTrash, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';

export default function TournamentsPanel() {
  const [tournaments, setTournaments] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const initialFormState = {
    tournamentName: '',
    location: '',
    description: '',
    registrationDeadline: '',
    maxSlots: 10,
    startDate: '',
    endDate: '',
    prizeFirst: 10000000,
    prizeSecond: 5000000,
    prizeThird: 2000000,
    minBetAmount: 50000,
    entryFee: 100000,
    minSlots: 3,
    allowedClasses: 'CLASS_A,CLASS_B',
    allowedAges: '3,4,5',
    allowedGenders: 'MALE,FEMALE',
    imageUrl: 'https://images.unsplash.com/photo-1598974357801-cbca100e6563?q=80&w=600',
    refereeId: '',
    registrationOpeningTime: '',
    officialRaceTime: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, rList] = await Promise.all([
        getTournamentsAPI(),
        getRefereesAPI()
      ]);
      setTournaments(tList);
      setReferees(rList);
      if (rList.length > 0 && !formData.refereeId) {
        setFormData(prev => ({ ...prev, refereeId: rList[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu giải đấu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      refereeId: referees.length > 0 ? referees[0].id : ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Format dates to fit backend expectation
    const formattedData = {
      ...formData,
      maxSlots: parseInt(formData.maxSlots),
      minSlots: parseInt(formData.minSlots),
      refereeId: parseInt(formData.refereeId),
      prizeFirst: parseFloat(formData.prizeFirst),
      prizeSecond: parseFloat(formData.prizeSecond),
      prizeThird: parseFloat(formData.prizeThird),
      minBetAmount: parseFloat(formData.minBetAmount),
      entryFee: parseFloat(formData.entryFee),
      // Ensure ISO format LocalDateTime (YYYY-MM-DDTHH:MM:SS)
      registrationDeadline: formData.registrationDeadline ? `${formData.registrationDeadline}:00` : null,
      registrationOpeningTime: formData.registrationOpeningTime ? `${formData.registrationOpeningTime}:00` : null,
      officialRaceTime: formData.officialRaceTime ? `${formData.officialRaceTime}:00` : null,
    };

    try {
      if (isEditing) {
        await updateTournamentAPI(editId, formattedData);
        setSuccess('Cập nhật giải đấu thành công!');
      } else {
        await createTournamentAPI(formattedData);
        setSuccess('Tạo giải đấu mới thành công!');
      }
      fetchData();
      resetForm();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu giải đấu.');
    }
  };

  // Edit helper
  const handleEditClick = (t) => {
    // Format dates back for datetime-local (YYYY-MM-DDTHH:mm)
    const formatLocalDateTime = (dtStr) => {
      if (!dtStr) return '';
      return dtStr.substring(0, 16);
    };

    setFormData({
      tournamentName: t.tournamentName || '',
      location: t.location || '',
      description: t.description || '',
      registrationDeadline: formatLocalDateTime(t.registrationDeadline),
      maxSlots: t.maxSlots || 10,
      startDate: t.startDate || '',
      endDate: t.endDate || '',
      prizeFirst: t.prizeFirst || 0,
      prizeSecond: t.prizeSecond || 0,
      prizeThird: t.prizeThird || 0,
      minBetAmount: t.minBetAmount || 0,
      entryFee: t.entryFee || 0,
      minSlots: t.minSlots || 3,
      allowedClasses: t.allowedClasses || 'CLASS_A,CLASS_B',
      allowedAges: t.allowedAges || '3,4,5',
      allowedGenders: t.allowedGenders || 'MALE,FEMALE',
      imageUrl: t.imageUrl || '',
      refereeId: t.refereeId || (referees.length > 0 ? referees[0].id : ''),
      registrationOpeningTime: formatLocalDateTime(t.registrationOpeningTime),
      officialRaceTime: formatLocalDateTime(t.officialRaceTime)
    });
    setEditId(t.id);
    setIsEditing(true);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giải đấu này không? Tất cả vòng đua liên quan cũng sẽ bị ảnh hưởng.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await deleteTournamentAPI(id);
      setSuccess('Xóa giải đấu thành công!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa giải đấu.');
    }
  };

  // Update Status
  const handleStatusChange = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      await updateTournamentStatusAPI(id, status);
      setSuccess(`Cập nhật trạng thái giải đấu thành ${status} thành công!`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTrophy style={{ color: 'var(--ho-accent-gold-text)' }} /> Quản Lý Giải Đấu Đua Ngựa
        </h2>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`btn ${showForm ? 'btn-outline-danger' : 'btn-success'} d-flex align-items-center gap-2 fw-bold`}
          style={{ fontSize: '14px', padding: '10px 18px' }}
        >
          {showForm ? 'Đóng Form' : <><FaPlus /> Thêm Giải Đấu</>}
        </button>
      </div>

      {/* Messages */}
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

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--ho-border-gold)' }}>
          <h3 className="ho-font-epilogue fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)', borderBottom: '1px solid var(--ho-border-gold)', paddingBottom: '10px' }}>
            {isEditing ? 'Cập Nhật Giải Đấu' : 'Tạo Giải Đấu Mới'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="ho-input-label">Tên giải đấu *</label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleInputChange}
                  required
                  className="ho-form-input text-dark fw-semibold"
                  placeholder="Nhập tên giải đấu (VD: Spring Championship 2026)"
                />
              </div>

              <div className="form-group">
                <label className="ho-input-label">Địa điểm tổ chức</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="ho-form-input text-dark fw-semibold"
                  placeholder="VD: Trường đua Đại Nam, Bình Dương"
                />
              </div>

              <div className="form-group">
                <label className="ho-input-label">Mô tả giải đấu</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="ho-form-input text-dark fw-semibold"
                  style={{ resize: 'vertical' }}
                  placeholder="Mô tả tóm tắt thể lệ, cơ cấu hoặc thông tin giải đấu..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Ngày kết thúc *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Mở đăng ký lúc</label>
                  <input
                    type="datetime-local"
                    name="registrationOpeningTime"
                    value={formData.registrationOpeningTime}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Hạn đăng ký *</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    required
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="ho-input-label">Giờ đua chính thức</label>
                <input
                  type="datetime-local"
                  name="officialRaceTime"
                  value={formData.officialRaceTime}
                  onChange={handleInputChange}
                  className="ho-form-input text-dark fw-semibold"
                />
              </div>
            </div>

            {/* Right Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Số ngựa tối thiểu *</label>
                  <input
                    type="number"
                    name="minSlots"
                    value={formData.minSlots}
                    onChange={handleInputChange}
                    required
                    min="2"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Số ngựa tối đa *</label>
                  <input
                    type="number"
                    name="maxSlots"
                    value={formData.maxSlots}
                    onChange={handleInputChange}
                    required
                    min="3"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Lệ phí tham gia (VND) *</label>
                  <input
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Tiền cược tối thiểu (VND) *</label>
                  <input
                    type="number"
                    name="minBetAmount"
                    value={formData.minBetAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Giải Nhất (VND) *</label>
                  <input
                    type="number"
                    name="prizeFirst"
                    value={formData.prizeFirst}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Giải Nhì (VND) *</label>
                  <input
                    type="number"
                    name="prizeSecond"
                    value={formData.prizeSecond}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Giải Ba (VND) *</label>
                  <input
                    type="number"
                    name="prizeThird"
                    value={formData.prizeThird}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="ho-form-input text-dark fw-semibold"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="ho-input-label">Trọng tài chịu trách nhiệm *</label>
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

              <div className="form-group">
                <label className="ho-input-label">Link Ảnh giải đấu</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="ho-form-input text-dark fw-semibold"
                  placeholder="URL hình ảnh (Unsplash, Imgur...)"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="ho-input-label">Hạng ngựa</label>
                  <input
                    type="text"
                    name="allowedClasses"
                    value={formData.allowedClasses}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="VD: CLASS_A,CLASS_B"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Độ tuổi</label>
                  <input
                    type="text"
                    name="allowedAges"
                    value={formData.allowedAges}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="VD: 3,4,5"
                  />
                </div>
                <div className="form-group">
                  <label className="ho-input-label">Giới tính</label>
                  <input
                    type="text"
                    name="allowedGenders"
                    value={formData.allowedGenders}
                    onChange={handleInputChange}
                    className="ho-form-input text-dark fw-semibold"
                    placeholder="VD: MALE,FEMALE"
                  />
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--ho-border-gold)', paddingTop: '15px' }}>
            <button
              type="button"
              onClick={resetForm}
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
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Giải Đấu'}
            </button>
          </div>
        </form>
      )}

      {/* Tournaments List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
          Danh Sách Giải Đấu Hiện Tại ({tournaments.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ho-text-muted)' }}>Đang tải danh sách giải đấu...</div>
        ) : tournaments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
            Chưa có giải đấu nào được khởi tạo.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {tournaments.map((t) => (
              <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '24px', border: '1px solid var(--ho-border-gold)' }}>
                
                {/* Thumbnail Image */}
                {t.imageUrl && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--ho-border-gold)' }}>
                    <img src={t.imageUrl} alt={t.tournamentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0, lineHeight: '1.3' }}>{t.tournamentName}</h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: t.tournamentStatus === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : t.tournamentStatus === 'Ongoing' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                    color: t.tournamentStatus === 'Completed' ? '#10b981' : t.tournamentStatus === 'Ongoing' ? '#3b82f6' : 'var(--ho-accent-gold-text)',
                    border: '1px solid var(--ho-border-gold)'
                  }}>
                    {t.tournamentStatus}
                  </span>
                </div>

                <p className="text-secondary small m-0" style={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', lineHeight: '1.5' }}>
                  {t.description || 'Không có mô tả chi tiết.'}
                </p>

                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', borderTop: '1px solid var(--ho-border-muted)', borderBottom: '1px solid var(--ho-border-muted)', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt /> Địa điểm:</span>
                    <span className="text-dark fw-semibold">{t.location || 'Chưa xác định'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt /> Thời gian:</span>
                    <span className="text-dark fw-semibold">{t.startDate} - {t.endDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaDollarSign /> Lệ phí đăng ký:</span>
                    <span style={{ color: 'var(--ho-accent-gold-text)', fontWeight: '700' }}>{t.entryFee?.toLocaleString()} VND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTrophy /> Tổng Giải Nhất:</span>
                    <span className="text-success fw-bold">{t.prizeFirst?.toLocaleString()} VND</span>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  
                  {/* Status Dropdown */}
                  <select
                    value={t.tournamentStatus}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid var(--ho-border-gold)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--ho-primary-dark)',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Open Registration">Open Registration</option>
                    <option value="Registration Closed">Registration Closed</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditClick(t)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      title="Sửa giải đấu"
                    >
                      <FaEdit size="14" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      title="Xóa giải đấu"
                    >
                      <FaTrash size="14" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
