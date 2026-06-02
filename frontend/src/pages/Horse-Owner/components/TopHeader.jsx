import React from 'react';

export default function TopHeader({ user, profile, setActiveTab }) {
  return (
    <header className="top-header ho-wrapper">
      {/* Page Title */}
      <div className="d-flex align-items-center">
        <h1 className="ho-font-epilogue fs-5 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
          EquineElite Pro
        </h1>
      </div>

      {/* Right controls */}
      <div className="d-flex align-items-center gap-3">
        {/* Search Bar */}
        <div className="header-search d-none d-md-block">
          <span className="material-symbols-outlined header-search-icon">
            search
          </span>
          <input
            className="header-search-input"
            placeholder="Search horses, races..."
            type="text"
          />
        </div>

        {/* Notifications */}
        <button
          className="ho-btn-light position-relative"
          style={{ width: '36px', height: '36px' }}
          onClick={() => alert("No new notifications")}
        >
          <span className="material-symbols-outlined text-dark" style={{ fontSize: '20px' }}>notifications</span>
          <span className="position-absolute bg-danger border border-white rounded-circle" style={{ top: '6px', right: '6px', width: '8px', height: '8px' }} />
        </button>

        {/* Settings */}
        <button
          className="ho-btn-light"
          style={{ width: '36px', height: '36px' }}
          onClick={() => alert("Settings panel is under development")}
        >
          <span className="material-symbols-outlined text-dark" style={{ fontSize: '20px' }}>settings</span>
        </button>

        {/* User profile avatar */}
        <div
          onClick={() => setActiveTab && setActiveTab('profile')}
          className="d-flex align-items-center gap-3 border-start ps-3"
          style={{ borderColor: 'var(--ho-border-muted)', cursor: 'pointer' }}
        >
          <div className="d-flex flex-column text-end d-none d-sm-flex">
            <span className="fs-7 fw-bold text-dark lh-sm">
              {profile?.fullName || user?.fullName || 'Horse Owner'}
            </span>
            <span className="ho-font-grotesk fw-bold text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
              {user?.role || 'Stable Manager'}
            </span>
          </div>
          <div className="rounded-circle overflow-hidden border cursor-pointer d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderColor: '#c0c9c0' }}>
            <img
              alt="User Profile Avatar"
              className="w-100 h-100 object-fit-cover"
              src={profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
              style={{
                transform: `translate(${profile?.avatarOffsetX || 0}%, ${profile?.avatarOffsetY || 0}%) scale(${profile?.avatarZoom || 1})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
