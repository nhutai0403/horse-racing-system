import React, { useState, useEffect } from 'react';
import {
  getConnectionsDirectoryAPI,
  getFriendsAPI,
  sendConnectionRequestAPI,
  respondToConnectionRequestAPI,
  deleteConnectionAPI
} from '../../services/connections';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';

export default function ConnectionsContent() {
  const [activeSubTab, setActiveSubTab] = useState('my-friends'); // 'my-friends' | 'find'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'JOCKEY' | 'HORSE_OWNER'
  
  const [friendsList, setFriendsList] = useState([]);
  const [directoryList, setDirectoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load friends list
  const loadFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFriendsAPI();
      setFriendsList(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải danh sách bạn bè.');
    } finally {
      setLoading(false);
    }
  };

  // Load directory list
  const loadDirectory = async (query = '', role = 'ALL') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConnectionsDirectoryAPI(query, role);
      setDirectoryList(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải danh mục kết nối.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to load data based on active tab and filters
  useEffect(() => {
    if (activeSubTab === 'my-friends') {
      loadFriends();
    } else {
      loadDirectory(searchQuery, roleFilter);
    }
  }, [activeSubTab, searchQuery, roleFilter]);

  // Action handlers
  const handleAddFriend = async (userId) => {
    try {
      const response = await sendConnectionRequestAPI(userId);
      // Update local directory list
      setDirectoryList(prev =>
        prev.map(user => user.userId === userId ? { ...user, friendStatus: 'PENDING_SENT', connectionId: response.connectionId } : user)
      );
    } catch (err) {
      alert(err.message || 'Không thể gửi yêu cầu kết bạn.');
    }
  };

  const handleAcceptRequest = async (connectionId, userId) => {
    try {
      const response = await respondToConnectionRequestAPI(connectionId, 'ACCEPT');
      // Update local directory list
      setDirectoryList(prev =>
        prev.map(user => user.userId === userId ? { ...user, friendStatus: 'FRIEND', connectionId: response.connectionId } : user)
      );
      // Reload friends list in background
      const friends = await getFriendsAPI();
      setFriendsList(friends);
    } catch (err) {
      alert(err.message || 'Không thể chấp nhận yêu cầu kết bạn.');
    }
  };

  const handleRejectRequest = async (connectionId, userId) => {
    try {
      await respondToConnectionRequestAPI(connectionId, 'REJECT');
      // Update local directory list
      setDirectoryList(prev =>
        prev.map(user => user.userId === userId ? { ...user, friendStatus: 'NONE', connectionId: null } : user)
      );
    } catch (err) {
      alert(err.message || 'Không thể từ chối yêu cầu.');
    }
  };

  const handleUnfriendOrCancel = async (connectionId, userId) => {
    try {
      await deleteConnectionAPI(connectionId);
      // Remove from friends list
      setFriendsList(prev => prev.filter(friend => friend.userId !== userId));
      // Update in directory list
      setDirectoryList(prev =>
        prev.map(user => user.userId === userId ? { ...user, friendStatus: 'NONE', connectionId: null } : user)
      );
    } catch (err) {
      alert(err.message || 'Thao tác thất bại.');
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Mạng lưới kết nối
          </h2>
          <p className="text-secondary small m-0">
            Quản lý các kết nối nài ngựa và tương tác với chủ chuồng ngựa khác.
          </p>
        </div>
      </div>

      {/* Connections Subtabs */}
      <div className="d-flex gap-3 mb-4">
        <button
          onClick={() => setActiveSubTab('my-friends')}
          className={`ho-tab-btn ${activeSubTab === 'my-friends' ? 'ho-tab-btn-active' : ''}`}
        >
          Bạn bè của tôi ({friendsList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('find')}
          className={`ho-tab-btn ${activeSubTab === 'find' ? 'ho-tab-btn-active' : ''}`}
        >
          Tìm kiếm kết nối
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 text-center" role="alert">
          {error}
        </div>
      )}

      {/* Tab: My Friends */}
      {!loading && activeSubTab === 'my-friends' && (
        <div className="row g-4">
          {friendsList.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card text-secondary italic">
              Chưa có bạn bè kết nối. Vui lòng chuyển qua "Tìm kiếm kết nối" để kết bạn với Nài ngựa hoặc Chủ ngựa!
            </div>
          ) : (
            friendsList.map((friend) => (
              <div key={friend.userId} className="col-12 col-md-6">
                <div className="glass-card glass-card-interactive d-flex align-items-center justify-content-between h-100 p-4">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '48px', height: '48px', borderColor: '#c0c9c0' }}>
                      <img
                        src={friend.avatar || DEFAULT_AVATAR}
                        alt={friend.fullName}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                        {friend.fullName}
                        <span className="text-secondary ms-2 fw-normal" style={{ fontSize: '11px' }}>ID: {friend.userId}</span>
                      </h4>
                      <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                        {friend.role ? friend.role.replace('_', ' ') : ''}
                      </p>
                      {friend.role === 'JOCKEY' && (
                        <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                          Exp: {friend.experienceYears || 0} năm • Cân nặng: {friend.weight || 0}kg
                        </p>
                      )}
                      {friend.role === 'HORSE_OWNER' && (
                        <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                          Trại ngựa: {friend.stableName || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ms-3 flex-shrink-0">
                    <button
                      onClick={() => handleUnfriendOrCancel(friend.connectionId, friend.userId)}
                      className="ho-btn ho-btn-outline-danger"
                    >
                      Hủy kết bạn
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Find Connections Directory */}
      {!loading && activeSubTab === 'find' && (
        <div className="d-flex flex-column gap-3">
          {/* Filters Row */}
          <div className="d-flex flex-column flex-sm-row gap-3 p-3 glass-card mb-4">
            <div className="position-relative flex-grow-1">
              <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ps-3 text-secondary">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm Nài ngựa/Chủ ngựa theo Tên hoặc ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ho-form-input ps-5 text-dark"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="ho-form-input text-dark fw-bold"
              style={{ width: 'auto' }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="JOCKEY">Chỉ Nài ngựa</option>
              <option value="HORSE_OWNER">Chỉ Chủ ngựa</option>
            </select>
          </div>

          {/* Directory Grid */}
          <div className="row g-4">
            {directoryList.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card text-secondary italic">
                Không tìm thấy người dùng nào phù hợp với bộ lọc.
              </div>
            ) : (
              directoryList.map((user) => (
                <div key={user.userId} className="col-12 col-md-6">
                  <div className="glass-card glass-card-interactive d-flex align-items-center justify-content-between h-100 p-4">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '48px', height: '48px', borderColor: '#c0c9c0' }}>
                        <img
                          src={user.avatar || DEFAULT_AVATAR}
                          alt={user.fullName}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                          {user.fullName}
                          <span className="text-secondary ms-2 fw-normal" style={{ fontSize: '11px' }}>ID: {user.userId}</span>
                        </h4>
                        <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                          {user.role ? user.role.replace('_', ' ') : ''}
                        </p>
                        {user.role === 'JOCKEY' && (
                          <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                            Exp: {user.experienceYears || 0} năm • Cân nặng: {user.weight || 0}kg
                          </p>
                        )}
                        {user.role === 'HORSE_OWNER' && (
                          <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                            Trại ngựa: {user.stableName || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reactive Action Buttons */}
                    <div className="ms-3 flex-shrink-0">
                      {user.friendStatus === 'FRIEND' && (
                        <span className="badge-custom badge-ready fw-bold py-1.5 px-3">
                          Bạn bè
                        </span>
                      )}

                      {user.friendStatus === 'PENDING_SENT' && (
                        <button
                          onClick={() => handleUnfriendOrCancel(user.connectionId, user.userId)}
                          className="ho-btn ho-btn-outline-secondary"
                        >
                          Đã gửi yêu cầu
                        </button>
                      )}

                      {user.friendStatus === 'PENDING_RECEIVED' && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(user.connectionId, user.userId)}
                            className="ho-btn ho-btn-dark-green"
                          >
                            Đồng ý
                          </button>
                          <button
                            onClick={() => handleRejectRequest(user.connectionId, user.userId)}
                            className="ho-btn ho-btn-outline-danger px-2.5"
                          >
                            &times;
                          </button>
                        </div>
                      )}

                      {user.friendStatus === 'NONE' && (
                        <button
                          onClick={() => handleAddFriend(user.userId)}
                          className="ho-btn ho-btn-gold-solid"
                        >
                          Kết bạn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
