import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import axiosClient from '../../../api/axiosClient';
import '../Spectator.css';

export default function SpectatorUpgradeRole() {
  const { user, accessToken, refreshToken, login } = useContext(AuthContext);

  // Upgrade Request States
  const [myRequest, setMyRequest] = useState(null);
  const [requestedRole, setRequestedRole] = useState('HORSE_OWNER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upgrade Form States
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');

  // Jockey specific states
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Horse Owner specific states
  const [stableName, setStableName] = useState('');
  const [stableAddress, setStableAddress] = useState('');

  // Referee specific states
  const [certificationNumber, setCertificationNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  // Upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');

  // Sync upgrade requests from the real backend API
  const syncRequests = async () => {
    if (user?.email) {
      try {
        const response = await axiosClient.get('/upgrade-requests/me');
        const myReqs = response.data;
        if (myReqs && myReqs.length > 0) {
          myReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setMyRequest(myReqs[0]);
        } else {
          setMyRequest(null);
        }
      } catch (err) {
        console.error("Failed to fetch upgrade requests:", err);
      }
    }
  };

  useEffect(() => {
    syncRequests();
    const interval = setInterval(syncRequests, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      alert("Bạn chỉ có thể tải lên tối đa 5 hình ảnh.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      const response = await axiosClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadedImages(prev => [...prev, ...response.data]);
    } catch (err) {
      console.error("Failed to upload files:", err);
      alert("Tải lên hình ảnh thất bại. Vui lòng kiểm tra lại định dạng tệp.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRequestUpgrade = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        requestedRole: requestedRole,
        notes: notes || ("Yêu cầu nâng cấp lên " + requestedRole.replace('_', ' ')),
        fullName,
        dateOfBirth,
        phoneNumber,
        identityNumber,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        licenseNumber,
        stableName,
        stableAddress,
        certificationNumber,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
        documentUrls: uploadedImages
      };

      await axiosClient.post('/upgrade-requests', payload);
      await syncRequests();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to submit request";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateRole = async () => {
    if (myRequest && myRequest.status === 'APPROVED') {
      try {
        // 1. Call refresh token to get a new access token with the updated role claim
        const refreshResponse = await axiosClient.post('/auth/refresh', {
          refreshToken: refreshToken,
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        
        // Temporarily store new tokens
        localStorage.setItem('horse_racing_accessToken', newAccessToken);
        localStorage.setItem('horse_racing_refreshToken', newRefreshToken);
        
        // 2. Fetch updated user profile
        const profileResponse = await axiosClient.get('/auth/me');
        const updatedUser = profileResponse.data;
        
        // 3. Save new session to AuthContext
        login({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: updatedUser,
        });

        // 4. Hard redirect to the corresponding dashboard
        if (myRequest.requestedRole === 'HORSE_OWNER') {
          window.location.href = '/owner';
        } else if (myRequest.requestedRole === 'JOCKEY') {
          window.location.href = '/jockey';
        } else if (myRequest.requestedRole === 'RACE_REFEREE') {
          window.location.href = '/referee';
        }
      } catch (err) {
        console.error("Failed to activate new role session:", err);
        alert("Failed to refresh session. Please try logging out and logging back in.");
      }
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Title */}
      <div className="mb-4">
        <span className="role-badge">SPECTATOR ROLE</span>
        <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">Nâng Cấp Tài Khoản</h2>
        <p className="text-secondary small">Trở thành thành viên chính thức với vai trò Chủ Ngựa, Nài Ngựa hoặc Trọng Tài hệ thống.</p>
      </div>

      <div className="row g-4 justify-content-center">
        
        {/* Main form card */}
        <div className="col-12 col-xl-8">
          <div className="glass-card">
            
            {/* Status alerts */}
            {myRequest && myRequest.status === 'PENDING' && (
              <div className="text-center py-4 px-3 mb-4 rounded border" 
                   style={{ background: 'rgba(252, 211, 77, 0.1)', borderColor: 'rgba(252, 211, 77, 0.3)' }}>
                <span className="badge bg-warning text-dark text-uppercase mb-2 py-1 px-3" style={{ fontSize: '12px' }}>
                  Hồ sơ đang chờ duyệt
                </span>
                <p className="text-dark m-0 small">
                  Yêu cầu nâng cấp lên vai trò <strong>{myRequest.requestedRole.replace('_', ' ')}</strong> đang chờ Ban quản trị phê duyệt.
                </p>
                <p className="text-secondary small mt-1 italic" style={{ fontSize: '12px' }}>
                  Thông tin phản hồi sẽ hiển thị tại đây sau khi Admin xem xét hồ sơ.
                </p>
              </div>
            )}

            {myRequest && myRequest.status === 'APPROVED' && (
              <div className="text-center py-4 px-3 mb-4 rounded border" 
                   style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <span className="badge bg-success text-white text-uppercase mb-2 py-1 px-3" style={{ fontSize: '12px' }}>
                  Yêu cầu được chấp thuận!
                </span>
                <p className="text-dark m-0 small">
                  Yêu cầu nâng cấp của bạn đã được phê duyệt. Hãy bấm nút dưới đây để kích hoạt vai trò mới.
                </p>
                <button 
                  onClick={handleActivateRole}
                  className="ho-btn ho-btn-gold-solid mt-3 py-2 px-4"
                  style={{ textTransform: 'none' }}
                >
                  Kích hoạt vai trò {myRequest.requestedRole.replace('_', ' ')}
                </button>
              </div>
            )}

            {myRequest && myRequest.status === 'REJECTED' && (
              <div className="text-center py-3 px-3 mb-4 rounded border text-danger" 
                   style={{ background: 'var(--ho-error-bg)', borderColor: 'rgba(186,26,26,0.2)' }}>
                <span className="badge bg-danger text-white text-uppercase mb-2">Hồ sơ bị từ chối</span>
                <p className="m-0 small fw-bold">Lý do: "{myRequest.rejectionReason || 'Không có lý do cụ thể'}"</p>
                <p className="m-0 small mt-1 text-secondary" style={{ fontSize: '12px' }}>Bạn có thể điều chỉnh thông tin bên dưới và gửi lại yêu cầu mới.</p>
              </div>
            )}

            {(!myRequest || myRequest.status === 'REJECTED') && (
              <form onSubmit={handleRequestUpgrade} className="d-flex flex-column gap-4">
                <p className="text-secondary small m-0" style={{ fontSize: '13.5px' }}>
                  Điền đầy đủ thông tin bên dưới và tải lên tài liệu chứng minh để nâng cấp tài khoản của bạn.
                </p>
                
                {/* Select role */}
                <div className="form-group">
                  <label className="ho-input-label">Chọn vai trò muốn nâng cấp</label>
                  <select 
                    value={requestedRole} 
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="form-select"
                    style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #c0c9c0' }}
                  >
                    <option value="HORSE_OWNER">Chủ trang trại ngựa (Horse Owner)</option>
                    <option value="JOCKEY">Nài ngựa (Jockey)</option>
                    <option value="RACE_REFEREE">Trọng tài đua (Race Referee)</option>
                  </select>
                </div>

                {/* Section 1: Personal Identification */}
                <div>
                  <h4 className="form-section-title">
                    <span className="material-symbols-outlined text-success">badge</span>
                    Thông Tin Định Danh Cá Nhân
                  </h4>
                  
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="ho-input-label">Họ và Tên</label>
                      <input 
                        type="text" 
                        required 
                        className="ho-form-input" 
                        placeholder="Nguyễn Văn A" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label className="ho-input-label">Số Điện Thoại</label>
                      <input 
                        type="tel" 
                        required 
                        className="ho-form-input" 
                        placeholder="09xxxxxxxx" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="ho-input-label">Ngày Sinh</label>
                      <input 
                        type="date" 
                        required 
                        className="ho-form-input" 
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                    
                    <div className="col-12 col-md-6">
                      <label className="ho-input-label">Số CCCD / Hộ Chiếu</label>
                      <input 
                        type="text" 
                        required 
                        className="ho-form-input" 
                        placeholder="0350xxxxxxxx" 
                        value={identityNumber}
                        onChange={(e) => setIdentityNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Specific specifications */}
                <div>
                  <h4 className="form-section-title">
                    <span className="material-symbols-outlined text-success">psychology</span>
                    Thông Tin Hồ Sơ Chuyên Môn
                  </h4>

                  {requestedRole === 'JOCKEY' && (
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="ho-input-label">Cân nặng (kg)</label>
                        <input 
                          type="number" 
                          required 
                          min="40"
                          max="80"
                          step="0.1"
                          className="ho-form-input" 
                          placeholder="55.5" 
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="ho-input-label">Chiều cao (cm)</label>
                        <input 
                          type="number" 
                          required 
                          min="100"
                          max="250"
                          className="ho-form-input" 
                          placeholder="165" 
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="ho-input-label">Số Giấy Phép Nài Ngựa (License Number)</label>
                        <input 
                          type="text" 
                          required 
                          className="ho-form-input" 
                          placeholder="Ví dụ: JC-998877" 
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {requestedRole === 'HORSE_OWNER' && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="ho-input-label">Tên Trang Trại (Stable Name)</label>
                        <input 
                          type="text" 
                          required 
                          className="ho-form-input" 
                          placeholder="Ví dụ: Trang trại ngựa Hùng Cường" 
                          value={stableName}
                          onChange={(e) => setStableName(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="ho-input-label">Địa Chỉ Trang Trại (Stable Address)</label>
                        <input 
                          type="text" 
                          required 
                          className="ho-form-input" 
                          placeholder="Số 12 Đường đua, Quận 9, TP.HCM" 
                          value={stableAddress}
                          onChange={(e) => setStableAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {requestedRole === 'RACE_REFEREE' && (
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="ho-input-label">Số Chứng Chỉ Trọng Tài</label>
                        <input 
                          type="text" 
                          required 
                          className="ho-form-input" 
                          placeholder="Ví dụ: REF-665544" 
                          value={certificationNumber}
                          onChange={(e) => setCertificationNumber(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="ho-input-label">Số Năm Kinh Nghiệm</label>
                        <input 
                          type="number" 
                          required 
                          min="0"
                          max="50"
                          className="ho-form-input" 
                          placeholder="5" 
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Upload files */}
                <div>
                  <h4 className="form-section-title">
                    <span className="material-symbols-outlined text-success">cloud_upload</span>
                    Bằng Cấp & Tài Liệu Xác Thực
                  </h4>

                  <label className="upload-dropzone" style={{ pointerEvents: isUploading ? 'none' : 'auto' }}>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="upload-icon" style={{ width: '36px', height: '36px', color: 'var(--ho-accent-gold)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <div className="upload-text text-secondary mt-2 small">
                      {isUploading ? 'Đang tải tệp lên máy chủ...' : (
                        <>Click để <strong>Tải ảnh lên</strong> hoặc Kéo & thả</>
                      )}
                    </div>
                    <div className="upload-subtext text-muted small" style={{ fontSize: '11px' }}>Hỗ trợ định dạng PNG, JPG, JPEG (tối đa 5 ảnh)</div>
                  </label>

                  {uploadedImages.length > 0 && (
                    <div className="preview-grid d-flex flex-wrap gap-2 mt-3">
                      {uploadedImages.map((imgUrl, index) => (
                        <div className="preview-item position-relative rounded overflow-hidden border" key={index} style={{ width: '80px', height: '80px', borderColor: 'var(--ho-border-gold)' }}>
                          <img src={`http://localhost:8080${imgUrl}`} alt="Preview" className="w-100 h-100 object-fit-cover" />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center" 
                            style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="ho-input-label">Ghi Chú Thêm</label>
                  <textarea 
                    className="ho-form-input" 
                    rows="3" 
                    placeholder="Giới thiệu bản thân hoặc lưu ý khác cho Ban quản trị..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="ho-btn ho-btn-gold-solid w-100 py-3 mt-2"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu nâng cấp vai trò'}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
