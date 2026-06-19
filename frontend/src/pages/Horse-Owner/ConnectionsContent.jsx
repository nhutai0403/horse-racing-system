import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import { useHorseOwner } from './HorseOwnerContext';
import {
  getConnectionsDirectoryAPI,
  getFriendsAPI,
  sendConnectionRequestAPI,
  respondToConnectionRequestAPI,
  deleteConnectionAPI
} from '../../services/connections';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';

export default function ConnectionsContent() {
  const [activeSubTab, setActiveSubTab] = useState('my-friends'); // 'my-friends' | 'find' | 'friend-requests'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { refreshData } = useHorseOwner();
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  const [friendsList, setFriendsList] = useState([]);
  const [directoryList, setDirectoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const friends = await getFriendsAPI();
      setFriendsList(friends);

      const directory = await getConnectionsDirectoryAPI(searchQuery, roleFilter);
      setDirectoryList(directory);
    } catch (err) {
      console.error('Lỗi khi tải kết nối:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [searchQuery, roleFilter, activeSubTab]);

  const handleAddFriend = async (recipientId) => {
    try {
      setLoading(true);
      await sendConnectionRequestAPI(recipientId);
      await refreshData();
      await fetchConnections();
    } catch (err) {
      alert('Gửi yêu cầu kết bạn thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondRequest = async (connectionId, action) => {
    try {
      setLoading(true);
      await respondToConnectionRequestAPI(connectionId, action);
      await refreshData();
      await fetchConnections();
    } catch (err) {
      alert('Trả lời yêu cầu kết bạn thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    try {
      setLoading(true);
      await deleteConnectionAPI(connectionId);
      await refreshData();
      await fetchConnections();
    } catch (err) {
      alert('Xóa kết nối thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const incomingRequests = directoryList.filter(user => user.friendStatus === 'PENDING_RECEIVED');

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
          onClick={() => setActiveSubTab('friend-requests')}
          className={`ho-tab-btn ${activeSubTab === 'friend-requests' ? 'ho-tab-btn-active' : ''}`}
        >
          Lời mời kết bạn ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('find')}
          className={`ho-tab-btn ${activeSubTab === 'find' ? 'ho-tab-btn-active' : ''}`}
        >
          Tìm kiếm kết nối
        </button>
      </div>

      {loading && (
        <div className="text-center py-4 text-success fw-bold">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Đang tải dữ liệu...
        </div>
      )}

      {/* Tab: My Friends */}
      {activeSubTab === 'my-friends' && !loading && (
        <div className="row g-4">
          {friendsList.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card text-secondary italic">
              Chưa có bạn bè kết nối. Vui lòng chuyển qua "Tìm kiếm kết nối" để kết bạn.
            </div>
          ) : (
            friendsList.map((friend) => (
              <div 
                key={friend.userId || friend.id} 
                className="col-12 col-md-6 col-lg-4 cursor-pointer hover-scale transition-all"
                onClick={() => {
                  setSelectedFriend(friend);
                  setShowFriendModal(true);
                }}
              >
                <DataCard interactive={false}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '60px', height: '60px', borderColor: '#c0c9c0' }}>
                      <img
                        src={friend.avatar || DEFAULT_AVATAR}
                        alt={friend.fullName}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                        {friend.fullName}
                      </h4>
                      <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                        {friend.role ? friend.role.replace('_', ' ') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-end" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDeleteConnection(friend.connectionId)}
                      className="ho-btn ho-btn-outline-danger btn-sm w-100 fw-bold"
                    >
                      Hủy kết bạn
                    </button>
                  </div>
                </DataCard>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Friend Requests */}
      {activeSubTab === 'friend-requests' && !loading && (
        <div className="row g-4">
          {incomingRequests.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card text-secondary italic">
              Không có lời mời kết bạn nào đang chờ duyệt.
            </div>
          ) : (
            incomingRequests.map((user) => (
              <div 
                key={user.userId || user.id} 
                className="col-12 col-md-6 col-lg-4 cursor-pointer hover-scale transition-all"
                onClick={() => {
                  setSelectedFriend(user);
                  setShowFriendModal(true);
                }}
              >
                <DataCard interactive={false}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '50px', height: '50px', borderColor: '#c0c9c0' }}>
                      <img
                        src={user.avatar || DEFAULT_AVATAR}
                        alt={user.fullName}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                        {user.fullName}
                      </h4>
                      <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                        {user.role ? user.role.replace('_', ' ') : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex gap-2">
                      <button 
                        onClick={() => handleRespondRequest(user.connectionId, 'ACCEPT')}
                        className="ho-btn ho-btn-dark-green flex-grow-1 fw-bold"
                      >
                        Đồng ý
                      </button>
                      <button 
                        onClick={() => handleRespondRequest(user.connectionId, 'REJECT')}
                        className="ho-btn ho-btn-outline-danger px-3 fw-bold"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                </DataCard>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Find Connections Directory */}
      {activeSubTab === 'find' && (
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
                Không tìm thấy người dùng nào phù hợp.
              </div>
            ) : (
              directoryList.map((user) => (
                <div 
                  key={user.userId || user.id} 
                  className="col-12 col-md-6 col-lg-4 cursor-pointer hover-scale transition-all"
                  onClick={() => {
                    setSelectedFriend(user);
                    setShowFriendModal(true);
                  }}
                >
                  <DataCard interactive={false}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '50px', height: '50px', borderColor: '#c0c9c0' }}>
                        <img
                          src={user.avatar || DEFAULT_AVATAR}
                          alt={user.fullName}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                          {user.fullName}
                        </h4>
                        <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                          {user.role ? user.role.replace('_', ' ') : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      {user.friendStatus === 'FRIEND' && (
                        <StatusBadge status="Bạn bè" customClass="w-100 justify-content-center" />
                      )}

                      {user.friendStatus === 'PENDING_SENT' && (
                        <button 
                          onClick={() => handleDeleteConnection(user.connectionId)}
                          className="ho-btn ho-btn-outline-secondary w-100 fw-bold"
                          title="Hủy yêu cầu"
                        >
                          Đã gửi yêu cầu
                        </button>
                      )}

                      {user.friendStatus === 'PENDING_RECEIVED' && (
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleRespondRequest(user.connectionId, 'ACCEPT')}
                            className="ho-btn ho-btn-dark-green flex-grow-1 fw-bold"
                          >
                            Đồng ý
                          </button>
                          <button 
                            onClick={() => handleRespondRequest(user.connectionId, 'REJECT')}
                            className="ho-btn ho-btn-outline-danger px-3 fw-bold"
                          >
                            &times;
                          </button>
                        </div>
                      )}

                      {user.friendStatus === 'NONE' && (
                        <button 
                          onClick={() => handleAddFriend(user.userId || user.id)}
                          className="ho-btn ho-btn-gold-solid w-100 fw-bold"
                        >
                          Kết bạn
                        </button>
                      )}
                    </div>
                  </DataCard>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Friend Details Modal */}
      {showFriendModal && selectedFriend && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={() => setShowFriendModal(false)}>
          <div className="modal-content-custom animate-scale-up" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
              <h3 className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                Chi tiết kết nối
              </h3>
              <button 
                onClick={() => setShowFriendModal(false)}
                className="btn-close"
                aria-label="Close"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>

            <div className="d-flex flex-column align-items-center gap-3 mb-4">
              <div className="rounded-circle overflow-hidden border shadow-sm" style={{ width: '90px', height: '90px', borderColor: 'var(--ho-accent-gold)' }}>
                <img 
                  src={selectedFriend.avatar || DEFAULT_AVATAR} 
                  alt={selectedFriend.fullName} 
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="fw-bold fs-5 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {selectedFriend.fullName}
                </h4>
                <p className="ho-font-grotesk fw-bold text-uppercase text-secondary small m-0 mt-1" style={{ letterSpacing: '0.05em' }}>
                  {selectedFriend.role.replace('_', ' ')}
                </p>
                {selectedFriend.description && (
                  <p className="text-secondary small m-0 mt-2 px-3" style={{ fontStyle: 'italic', fontSize: '13px', lineHeight: '1.4', color: 'var(--ho-primary-dark)', opacity: 0.85 }}>
                    "{selectedFriend.description}"
                  </p>
                )}
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mb-0 p-3 rounded" style={{ backgroundColor: 'var(--ho-bg-cream)', border: '1px solid var(--ho-border-muted)' }}>
              {selectedFriend.role === 'JOCKEY' && (
                <>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Email:</span>
                    <span className="text-secondary">{selectedFriend.email || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Số điện thoại:</span>
                    <span className="text-secondary">{selectedFriend.phoneNumber || selectedFriend.phone || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Số năm kinh nghiệm:</span>
                    <span className="text-secondary fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>{selectedFriend.experienceYears} năm</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Số trận đã tham gia:</span>
                    <span className="text-secondary">{selectedFriend.matchesPlayed} trận</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="fw-bold text-dark">Số giấy phép (License):</span>
                    <span className="text-secondary small font-monospace">{selectedFriend.licenseNumber}</span>
                  </div>
                </>
              )}
              {selectedFriend.role === 'HORSE_OWNER' && (
                <>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Email:</span>
                    <span className="text-secondary">{selectedFriend.email || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Số điện thoại:</span>
                    <span className="text-secondary">{selectedFriend.phoneNumber || selectedFriend.phone || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="fw-bold text-dark">Tên trang trại (Stable):</span>
                    <span className="text-secondary fw-bold" style={{ color: 'var(--ho-primary-dark)' }}>{selectedFriend.stableName || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="fw-bold text-dark">Địa chỉ trang trại:</span>
                    <span className="text-secondary text-end small" style={{ maxWidth: '240px' }}>{selectedFriend.stableAddress || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
