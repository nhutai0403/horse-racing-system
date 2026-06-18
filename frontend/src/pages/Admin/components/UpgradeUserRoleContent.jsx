import React, { useState, useEffect } from 'react';
import { getUpgradeRequestsAPI, approveUpgradeRequestAPI, rejectUpgradeRequestAPI } from '../../../services/admin';
import { FaCheck, FaTimes, FaUserCheck, FaInfoCircle, FaCheckCircle, FaSearch, FaFilter, FaCalendarAlt, FaEnvelope, FaPhoneAlt, FaIdCard, FaFileAlt } from 'react-icons/fa';

export default function UpgradeUserRoleContent() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ show: false, requestId: null, reason: '' });

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUpgradeRequestsAPI();
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách yêu cầu nâng cấp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu nâng cấp vai trò này không?')) return;
    setError('');
    setSuccess('');
    try {
      await approveUpgradeRequestAPI(id);
      setSuccess('Đã duyệt yêu cầu nâng cấp vai trò thành công!');
      loadRequests();
    } catch (err) {
      setError(err.message || 'Không thể duyệt yêu cầu.');
    }
  };

  const handleRejectClick = (id) => {
    setRejectionModal({ show: true, requestId: id, reason: '' });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionModal.reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await rejectUpgradeRequestAPI(rejectionModal.requestId, rejectionModal.reason.trim());
      setSuccess('Đã từ chối yêu cầu nâng cấp vai trò.');
      setRejectionModal({ show: false, requestId: null, reason: '' });
      loadRequests();
    } catch (err) {
      setError(err.message || 'Không thể từ chối yêu cầu.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesSearch = 
      (req.fullName || req.userFullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.requestedRole || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Page Styles */}
      <style>{`
        .doc-gallery {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .doc-thumbnail {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid var(--ho-border-gold);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .doc-thumbnail:hover {
          transform: scale(1.05);
        }
        .details-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px 16px;
          background: rgba(0, 56, 32, 0.02);
          border: 1px solid var(--ho-border-muted);
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 10px;
          font-size: 13px;
        }
        .details-label {
          font-weight: 700;
          color: var(--ho-primary-dark);
          text-align: left;
        }
        .details-value {
          color: var(--ho-text-dark);
          text-align: left;
          font-weight: 500;
        }
      `}</style>

      {/* Title */}
      <div className="mb-4">
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUserCheck style={{ color: 'var(--ho-accent-gold-text)' }} /> Yêu Cầu Nâng Cấp Vai Trò
        </h2>
        <p className="text-secondary small m-0">
          Xem xét thông tin cá nhân, bằng cấp, chứng chỉ và xử lý duyệt/từ chối nâng cấp vai trò của người chơi.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaCheckCircle style={{ color: '#10b981' }} /> {success}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card mb-4 p-3 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-stretch align-items-md-center" style={{ border: '1px solid var(--ho-border-gold)' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '280px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ho-primary-medium)', opacity: 0.7 }} />
          <input
            type="text"
            className="ho-form-input text-dark fw-semibold"
            placeholder="Tìm kiếm theo tên, email, vai trò..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', fontSize: '14px', height: '42px' }}
          />
        </div>

        {/* Status Filter */}
        <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 auto' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ho-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            <FaFilter className="me-1" /> Trạng thái:
          </span>
          <select
            className="ho-form-input text-dark fw-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '14px', minWidth: '180px', height: '42px', paddingRight: '24px' }}
          >
            <option value="PENDING">Chờ xử lý (PENDING)</option>
            <option value="APPROVED">Đã duyệt (APPROVED)</option>
            <option value="REJECTED">Bị từ chối (REJECTED)</option>
            <option value="ALL">Tất cả yêu cầu</option>
          </select>
        </div>

      </div>

      {/* Requests Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--ho-text-muted)' }}>Đang tải danh sách yêu cầu nâng cấp...</div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
          Không tìm thấy yêu cầu nâng cấp vai trò nào.
        </div>
      ) : (
        <div className="row g-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="col-12 col-lg-6">
              <div className="glass-card h-100 d-flex flex-column justify-content-between" style={{ border: '1px solid var(--ho-border-gold)', padding: '24px' }}>
                
                {/* Request Header */}
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-1">{req.fullName || req.userFullName || 'Thành viên'}</h4>
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <FaEnvelope size="11" /> <span>{req.userEmail}</span>
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(252, 211, 77, 0.15)',
                      color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#ef4444' : 'var(--ho-accent-gold-text)',
                      border: '1px solid var(--ho-border-gold)'
                    }}>
                      {req.status}
                    </span>
                  </div>

                  {/* Transition path */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>SPECTATOR</span>
                    <span className="text-secondary">&rarr;</span>
                    <span className="badge bg-primary text-uppercase" style={{ fontSize: '10px' }}>
                      {req.requestedRole?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="details-grid">
                    <span className="details-label"><FaPhoneAlt size="11" className="me-1" /> Điện thoại:</span>
                    <span className="details-value">{req.phoneNumber || 'N/A'}</span>

                    <span className="details-label"><FaCalendarAlt size="11" className="me-1" /> Ngày sinh:</span>
                    <span className="details-value">{req.dateOfBirth || 'N/A'}</span>

                    <span className="details-label"><FaIdCard size="11" className="me-1" /> CCCD/Hộ chiếu:</span>
                    <span className="details-value">{req.identityNumber || 'N/A'}</span>

                    {/* Conditional Role Details */}
                    {req.requestedRole === 'JOCKEY' && (
                      <>
                        <span className="details-label">Cân nặng:</span>
                        <span className="details-value">{req.weight ? `${req.weight} kg` : 'N/A'}</span>

                        <span className="details-label">Chiều cao:</span>
                        <span className="details-value">{req.height ? `${req.height} cm` : 'N/A'}</span>

                        <span className="details-label">Số GP kỵ sĩ:</span>
                        <span className="details-value">{req.licenseNumber || 'N/A'}</span>
                      </>
                    )}

                    {req.requestedRole === 'HORSE_OWNER' && (
                      <>
                        <span className="details-label">Tên trang trại:</span>
                        <span className="details-value">{req.stableName || 'N/A'}</span>

                        <span className="details-label">Địa chỉ trang trại:</span>
                        <span className="details-value">{req.stableAddress || 'N/A'}</span>
                      </>
                    )}

                    {req.requestedRole === 'RACE_REFEREE' && (
                      <>
                        <span className="details-label">Số chứng chỉ:</span>
                        <span className="details-value">{req.certificationNumber || 'N/A'}</span>

                        <span className="details-label">Kinh nghiệm:</span>
                        <span className="details-value">{req.experienceYears !== null ? `${req.experienceYears} năm` : 'N/A'}</span>
                      </>
                    )}

                    {req.notes && (
                      <>
                        <span className="details-label" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--ho-border-muted)', paddingTop: '8px', marginTop: '4px' }}>Ghi chú gửi kèm:</span>
                        <span className="details-value" style={{ gridColumn: 'span 2', color: 'var(--ho-text-muted)', fontStyle: 'italic', fontSize: '13px' }}>
                          "{req.notes}"
                        </span>
                      </>
                    )}

                    {req.rejectionReason && (
                      <>
                        <span className="details-label text-danger" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--ho-border-muted)', paddingTop: '8px', marginTop: '4px' }}>Lý do từ chối:</span>
                        <span className="details-value text-danger" style={{ gridColumn: 'span 2', fontStyle: 'italic', fontSize: '13px' }}>
                          "{req.rejectionReason}"
                        </span>
                      </>
                    )}
                  </div>

                  {/* Documents & Credentials */}
                  {req.documentUrls && req.documentUrls.length > 0 && (
                    <div className="mt-3">
                      <span className="ho-input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', margin: 0 }}><FaFileAlt /> Tài liệu chứng thực:</span>
                      <div className="doc-gallery">
                        {req.documentUrls.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={`http://localhost:8080${url}`} 
                            alt={`certificate-${idx}`} 
                            className="doc-thumbnail"
                            onClick={() => setLightboxImage(`http://localhost:8080${url}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Only show for PENDING status) */}
                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--ho-border-muted)', paddingTop: '15px' }}>
                    <button
                      onClick={() => handleRejectClick(req.id)}
                      className="btn btn-outline-danger btn-sm fw-bold"
                      style={{ flex: 1, height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaTimes /> Từ chối
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="btn btn-success btn-sm fw-bold"
                      style={{ flex: 1, height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaCheck /> Phê duyệt
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={lightboxImage} 
            alt="certificate-lightbox" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', border: '2px solid #ffffff' }} 
          />
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal.show && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <form 
            onSubmit={handleRejectSubmit}
            className="glass-card"
            style={{
              width: '450px',
              padding: '24px',
              border: '1px solid var(--ho-border-gold)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', borderBottom: '1px solid var(--ho-border-gold)', paddingBottom: '10px', margin: 0 }}>
              Từ Chối Yêu Cầu Nâng Cấp
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">Lý do từ chối *</label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="4"
                required
                placeholder="Nhập lý do chi tiết để thông báo cho người dùng..."
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setRejectionModal({ show: false, requestId: null, reason: '' })}
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm fw-bold"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Từ chối đơn
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
