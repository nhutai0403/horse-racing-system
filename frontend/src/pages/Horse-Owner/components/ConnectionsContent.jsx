import React, { useState } from 'react';

export default function ConnectionsContent({ systemUsers, setSystemUsers }) {
  const [activeSubTab, setActiveSubTab] = useState('my-friends'); // 'my-friends' | 'find'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'JOCKEY' | 'HORSE_OWNER'

  const handleUpdateStatus = (id, newStatus) => {
    setSystemUsers(prev => 
      prev.map(user => user.id === id ? { ...user, friendStatus: newStatus } : user)
    );
  };

  // Filter friends list
  const friendsList = systemUsers.filter(u => u.friendStatus === 'FRIEND');

  // Filter search directory list
  const directoryList = systemUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'var(--ho-border-muted)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Network Connections
          </h2>
          <p className="text-secondary small m-0">
            Manage your jockey connections and interact with other stable owners.
          </p>
        </div>
      </div>

      {/* Connections Subtabs */}
      <div className="d-flex gap-3 mb-4">
        <button
          onClick={() => setActiveSubTab('my-friends')}
          className={`ho-tab-btn ${activeSubTab === 'my-friends' ? 'ho-tab-btn-active' : ''}`}
        >
          My Friends ({friendsList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('find')}
          className={`ho-tab-btn ${activeSubTab === 'find' ? 'ho-tab-btn-active' : ''}`}
        >
          Find Connections
        </button>
      </div>

      {/* Tab: My Friends */}
      {activeSubTab === 'my-friends' && (
        <div className="row g-4">
          {friendsList.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card text-secondary italic">
              No connected friends yet. Go to "Find Connections" to connect with Jockeys or Horse Owners!
            </div>
          ) : (
            friendsList.map((friend) => (
              <div key={friend.id} className="col-12 col-md-6">
                <div className="glass-card glass-card-interactive d-flex align-items-center justify-content-between h-100 p-4">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '48px', height: '48px', borderColor: '#c0c9c0' }}>
                      <img
                        src={friend.avatar}
                        alt={friend.fullName}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                        {friend.fullName}
                        <span className="text-secondary ms-2 fw-normal" style={{ fontSize: '11px' }}>ID: {friend.id}</span>
                      </h4>
                      <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                        {friend.role.replace('_', ' ')}
                      </p>
                      {friend.role === 'JOCKEY' && (
                        <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                          Exp: {friend.experienceYears} years • Weight: {friend.weight}kg
                        </p>
                      )}
                      {friend.role === 'HORSE_OWNER' && (
                        <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                          Stable: {friend.stableName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ms-3 flex-shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(friend.id, 'NONE')}
                      className="ho-btn ho-btn-outline-danger"
                    >
                      Unfriend
                    </button>
                  </div>
                </div>
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
                placeholder="Search Jockeys/Owners by Name or ID..."
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
              <option value="ALL">All Roles</option>
              <option value="JOCKEY">Jockeys Only</option>
              <option value="HORSE_OWNER">Horse Owners Only</option>
            </select>
          </div>

          {/* Directory Grid */}
          <div className="row g-4">
            {directoryList.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card text-secondary italic">
                No users found matching the filter criteria.
              </div>
            ) : (
              directoryList.map((user) => (
                <div key={user.id} className="col-12 col-md-6">
                  <div className="glass-card glass-card-interactive d-flex align-items-center justify-content-between h-100 p-4">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <div className="rounded-circle overflow-hidden border flex-shrink-0" style={{ width: '48px', height: '48px', borderColor: '#c0c9c0' }}>
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="fw-bold fs-6 m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                          {user.fullName}
                          <span className="text-secondary ms-2 fw-normal" style={{ fontSize: '11px' }}>ID: {user.id}</span>
                        </h4>
                        <p className="ho-font-grotesk fw-bold text-uppercase text-secondary m-0 mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                          {user.role.replace('_', ' ')}
                        </p>
                        {user.role === 'JOCKEY' && (
                          <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                            Exp: {user.experienceYears} yrs • Weight: {user.weight}kg
                          </p>
                        )}
                        {user.role === 'HORSE_OWNER' && (
                          <p className="text-secondary small m-0 mt-1" style={{ fontSize: '11px' }}>
                            Stable: {user.stableName || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reactive Action Buttons */}
                    <div className="ms-3 flex-shrink-0">
                      {user.friendStatus === 'FRIEND' && (
                        <span className="badge-custom badge-ready fw-bold py-1.5 px-3">
                          Friends
                        </span>
                      )}

                      {user.friendStatus === 'PENDING_SENT' && (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'NONE')}
                          className="ho-btn ho-btn-outline-secondary"
                        >
                          Pending Sent
                        </button>
                      )}

                      {user.friendStatus === 'PENDING_RECEIVED' && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'FRIEND')}
                            className="ho-btn ho-btn-dark-green"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'NONE')}
                            className="ho-btn ho-btn-outline-danger px-2.5"
                          >
                            &times;
                          </button>
                        </div>
                      )}

                      {user.friendStatus === 'NONE' && (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'PENDING_SENT')}
                          className="ho-btn ho-btn-gold-solid"
                        >
                          Add Friend
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
