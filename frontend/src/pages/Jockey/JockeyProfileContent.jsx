import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJockey } from './JockeyContext';
import { updateJockeyProfileAPI } from '../../services/jockey';

export default function JockeyProfileContent() {
  const navigate = useNavigate();
  const { profile, setProfile, refreshData } = useJockey();
  
  useEffect(() => {
    const handleRefresh = () => {
      if (refreshData && document.visibilityState === 'visible') {
        refreshData();
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, []); // Empty array prevents infinite loop
  
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

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Hồ sơ Kỵ sĩ
          </h2>
          <p className="text-secondary small m-0">
            Quản lý các thông số kỹ thuật, kỹ năng và thông tin liên lạc của bạn.
          </p>
        </div>
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
                  <label className="ho-input-label ho-font-grotesk">Biography & Skill Notes</label>
                  <textarea
                    className="ho-form-input text-dark"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="text-end mt-2">
                  <button type="submit" className="ho-btn ho-btn-gold-solid py-2 px-5 fw-bold">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
}
