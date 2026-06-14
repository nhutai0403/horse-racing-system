import { useState } from 'react';
import { createPortal } from 'react-dom';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import { useHorseOwner } from './HorseOwnerContext';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';

export default function ConnectionsContent() {
  const [activeSubTab, setActiveSubTab] = useState('my-friends'); // 'my-friends' | 'find'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { systemUsers = [], setSystemUsers } = useHorseOwner();
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleUpdateFriendStatus = (userId, newStatus) => {
    setSystemUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, friendStatus: newStatus } : user
      )
    );
  };

  // Friends are those with friendStatus === 'FRIEND'
  const friendsList = systemUsers.filter(u => u.friendStatus === 'FRIEND');
  
  // Directory is all, but filterable
  let directoryList = systemUsers;
  if (roleFilter !== 'ALL') {
    directoryList = directoryList.filter(u => u.role === roleFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    directoryList = directoryList.filter(u => u.fullName.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }

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

      {/* Tab: My Friends */}
      {activeSubTab === 'my-friends' && (
        <div className="row g-4">
          {friendsList.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card text-secondary italic">
              Chưa có bạn bè kết nối. Vui lòng chuyển qua "Tìm kiếm kết nối" để kết bạn.
            </div>
          ) : (
            friendsList.map((friend) => (
              <div 
                key={friend.id} 
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
                        {friend.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-end" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleUpdateFriendStatus(friend.id, 'NONE')}
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
                  key={user.id} 
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
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      {user.friendStatus === 'FRIEND' && (
                        <StatusBadge status="Bạn bè" customClass="w-100 justify-content-center" />
                      )}

                      {user.friendStatus === 'PENDING_SENT' && (
                        <button 
                          onClick={() => handleUpdateFriendStatus(user.id, 'NONE')}
                          className="ho-btn ho-btn-outline-secondary w-100 fw-bold"
                          title="Hủy yêu cầu"
                        >
                          Đã gửi yêu cầu
                        </button>
                      )}

                      {user.friendStatus === 'PENDING_RECEIVED' && (
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleUpdateFriendStatus(user.id, 'FRIEND')}
                            className="ho-btn ho-btn-dark-green flex-grow-1 fw-bold"
                          >
                            Đồng ý
                          </button>
                          <button 
                            onClick={() => handleUpdateFriendStatus(user.id, 'NONE')}
                            className="ho-btn ho-btn-outline-danger px-3 fw-bold"
                          >
                            &times;
                          </button>
                        </div>
                      )}

                      {user.friendStatus === 'NONE' && (
                        <button 
                          onClick={() => handleUpdateFriendStatus(user.id, 'PENDING_SENT')}
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
