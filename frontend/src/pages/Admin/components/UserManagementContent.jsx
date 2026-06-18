import React, { useState, useEffect } from 'react';
import { getRefereesAPI } from '../../../services/admin';
import DataTable from '../../../components/DataTable';
import { FaSearch, FaFilter, FaToggleOn, FaToggleOff, FaUserCircle, FaPlus, FaEdit, FaTrash, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

export default function UserManagementContent() {
  const [referees, setReferees] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form & CRUD States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    username: '',
    email: '',
    fullName: '',
    phone: '',
    role: 'SPECTATOR',
    enabled: true
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const refList = await getRefereesAPI().catch(() => []);
        setReferees(refList);

        // Predefined mock users representing various roles in the system
        const mockUsers = [
          { id: 1, username: 'owner1', email: 'owner1@test.com', fullName: 'Test HORSE_OWNER 1', phone: '0123400021', role: 'HORSE_OWNER', enabled: true },
          { id: 2, username: 'owner2', email: 'owner2@test.com', fullName: 'Test HORSE_OWNER 2', phone: '0123400022', role: 'HORSE_OWNER', enabled: true },
          { id: 3, username: 'jockey1', email: 'jockey1@test.com', fullName: 'Test JOCKEY 1', phone: '0123400031', role: 'JOCKEY', enabled: true },
          { id: 4, username: 'jockey2', email: 'jockey2@test.com', fullName: 'Test JOCKEY 2', phone: '0123400032', role: 'JOCKEY', enabled: true },
          { id: 5, username: 'spectator1', email: 'spectator1@test.com', fullName: 'Test SPECTATOR 1', phone: '0123400011', role: 'SPECTATOR', enabled: true },
          { id: 6, username: 'spectator2', email: 'spectator2@test.com', fullName: 'Test SPECTATOR 2', phone: '0123400012', role: 'SPECTATOR', enabled: true },
          { id: 7, username: 'admin', email: 'admin@gmail.com', fullName: 'System Administrator', phone: '0987654321', role: 'ADMIN', enabled: true },
          { id: 8, username: 'nguyennhutai', email: 'tainnse170563@fpt.edu.vn', fullName: 'nguyennhutai(k17hcm)', phone: '0854498305', role: 'SPECTATOR', enabled: true }
        ];

        // Format backend referees to match
        const formattedReferees = refList.map((ref, idx) => ({
          id: 100 + idx,
          username: ref.username || 'referee_' + ref.id,
          email: ref.email,
          fullName: ref.fullName || 'Default Referee',
          phone: ref.phone || 'N/A',
          role: 'RACE_REFEREE',
          enabled: ref.enabled
        }));

        setUsersList([...mockUsers, ...formattedReferees]);
      } catch (err) {
        console.error('Lỗi khi tải trọng tài:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleStatus = (id) => {
    setUsersList(prev =>
      prev.map(user => {
        if (user.id === id) {
          const newStatus = !user.enabled;
          setSuccess(`Đã thay đổi trạng thái của tài khoản @${user.username} thành ${newStatus ? 'Hoạt động' : 'Tạm khóa'}.`);
          return { ...user, enabled: newStatus };
        }
        return user;
      })
    );
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc.');
      return;
    }

    // Check duplicate username or email
    const isDuplicate = usersList.some(u => 
      u.id !== editId && 
      (u.username.toLowerCase() === formData.username.trim().toLowerCase() ||
       u.email.toLowerCase() === formData.email.trim().toLowerCase())
    );

    if (isDuplicate) {
      setError('Tên tài khoản hoặc Email này đã tồn tại trong hệ thống.');
      return;
    }

    if (isEditing) {
      // Update
      setUsersList(prev =>
        prev.map(u => (u.id === editId ? { ...formData, id: editId, username: formData.username.trim(), email: formData.email.trim(), fullName: formData.fullName.trim() } : u))
      );
      setSuccess(`Cập nhật tài khoản @${formData.username} thành công!`);
    } else {
      // Create
      const newUser = {
        ...formData,
        id: Date.now(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim()
      };
      setUsersList(prev => [newUser, ...prev]);
      setSuccess(`Tạo mới tài khoản @${formData.username} thành công!`);
    }

    resetForm();
  };

  const handleEditClick = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
      enabled: user.enabled
    });
    setEditId(user.id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản @${user.username} không? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setError('');
    setSuccess('');
    setUsersList(prev => prev.filter(u => u.id !== user.id));
    setSuccess(`Đã xóa thành công tài khoản @${user.username}.`);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: 'fullName',
      label: 'Người dùng',
      render: (item) => (
        <div className="d-flex align-items-center">
          <FaUserCircle className="me-2 text-secondary" style={{ fontSize: '28px' }} />
          <div className="d-flex flex-column">
            <span className="fw-bold text-dark">{item.fullName}</span>
            <span className="text-muted small" style={{ fontSize: '11px' }}>@{item.username}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email / Điện thoại',
      render: (item) => (
        <div className="d-flex flex-column">
          <span className="text-secondary small">{item.email}</span>
          <span className="text-muted small" style={{ fontSize: '11px' }}>{item.phone}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (item) => {
        let badgeClass = 'bg-secondary';
        if (item.role === 'ADMIN') badgeClass = 'bg-danger';
        else if (item.role === 'HORSE_OWNER') badgeClass = 'bg-primary';
        else if (item.role === 'JOCKEY') badgeClass = 'bg-info text-dark';
        else if (item.role === 'RACE_REFEREE') badgeClass = 'bg-success';
        
        return (
          <span className={`badge ${badgeClass} fw-bold text-uppercase`} style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
            {item.role}
          </span>
        );
      }
    },
    {
      key: 'enabled',
      label: 'Trạng thái',
      render: (item) => (
        <span className={`badge ${item.enabled ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
          {item.enabled ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      )
    },
    {
      key: 'statusToggle',
      label: 'Khóa/Mở',
      align: 'center',
      render: (item) => (
        <button
          onClick={() => handleToggleStatus(item.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: item.enabled ? '#10b981' : '#a0aec0',
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            transition: 'color 0.2s'
          }}
          title={item.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        >
          {item.enabled ? <FaToggleOn style={{ color: '#10b981' }} /> : <FaToggleOff style={{ color: '#a0aec0' }} />}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Hành động',
      align: 'center',
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            onClick={() => handleEditClick(item)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Sửa thông tin"
          >
            <FaEdit size="12" />
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Xóa người dùng"
          >
            <FaTrash size="12" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Title & Action Buttons */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Quản Lý Thành Viên
          </h2>
          <p className="text-secondary small m-0">
            Xem danh sách, tìm kiếm, lọc và thực hiện các chức năng Thêm, Sửa, Xóa hoặc Khóa người dùng.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`btn ${showForm ? 'btn-outline-danger' : 'btn-success'} d-flex align-items-center gap-2 fw-bold`}
          style={{ fontSize: '14px', padding: '10px 18px' }}
        >
          {showForm ? 'Đóng Form' : <><FaPlus /> Thêm Thành Viên</>}
        </button>
      </div>

      {/* Message alerts */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', color: '#34d399', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaCheckCircle style={{ color: '#10b981' }} /> {success}
        </div>
      )}

      {/* CRUD Form Panel */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
            {isEditing ? 'Cập Nhật Thông Tin Thành Viên' : 'Thêm Thành Viên Mới'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="row g-3">
              <div className="col-12 col-md-6 form-group">
                <label className="profile-label">Tên tài khoản (Username) *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập tên tài khoản (VD: spectator1)"
                />
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="profile-label">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập họ và tên đầy đủ..."
                />
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="profile-label">Email liên hệ *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập email..."
                />
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="profile-label">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              <div className="col-12 col-md-6 form-group">
                <label className="profile-label">Vai trò hệ thống *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="SPECTATOR">SPECTATOR (Khán giả)</option>
                  <option value="HORSE_OWNER">HORSE_OWNER (Chủ ngựa)</option>
                  <option value="JOCKEY">JOCKEY (Kỵ sĩ)</option>
                  <option value="RACE_REFEREE">RACE_REFEREE (Trọng tài)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="col-12 col-md-6 d-flex align-items-center mt-4 pt-2">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="userEnabledSwitch"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label text-dark fw-bold ms-2" htmlFor="userEnabledSwitch" style={{ cursor: 'pointer' }}>
                    Kích hoạt tài khoản ngay khi tạo
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline-secondary btn-sm"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-success btn-sm fw-bold"
              style={{ padding: '8px 24px', fontSize: '13px' }}
            >
              {isEditing ? 'Lưu Thay Đổi' : 'Thêm Thành Viên'}
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Controls */}
      <div className="glass-card mb-4 p-3 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-stretch align-items-md-center" style={{ border: '1px solid var(--ho-border-gold)' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '280px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ho-primary-medium)', opacity: 0.7 }} />
          <input
            type="text"
            className="ho-form-input text-dark fw-semibold"
            placeholder="Tìm kiếm theo tên, email, tên tài khoản..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', fontSize: '14px', height: '42px' }}
          />
        </div>

        {/* Role Filter */}
        <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 auto' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ho-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            <FaFilter className="me-1" /> Lọc vai trò:
          </span>
          <select
            className="ho-form-input text-dark fw-semibold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ fontSize: '14px', minWidth: '180px', height: '42px', paddingRight: '24px' }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">ADMIN</option>
            <option value="HORSE_OWNER">HORSE OWNER</option>
            <option value="JOCKEY">JOCKEY</option>
            <option value="RACE_REFEREE">RACE REFEREE</option>
            <option value="SPECTATOR">SPECTATOR</option>
          </select>
        </div>

      </div>

      {/* User Data Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>Đang tải danh sách thành viên...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="Không tìm thấy thành viên nào khớp với điều kiện tìm kiếm."
          />
        )}
      </div>

    </div>
  );
}
