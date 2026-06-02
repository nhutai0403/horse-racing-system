import React from 'react';

export default function SidebarNav({ activeTab, setActiveTab, logout }) {
  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'stable', icon: 'bedroom_child', label: 'Stable' },
    { id: 'entries', icon: 'emoji_events', label: 'Race Entries' },
    { id: 'friends', icon: 'group', label: 'Connections' },
    { id: 'financials', icon: 'payments', label: 'Financials' },
    { id: 'analytics', icon: 'analytics', label: 'Analytics' },
    { id: 'profile', icon: 'account_circle', label: 'Stable Profile' },
  ];

  return (
    <nav className="sidebar-nav ho-font-grotesk">
      {/* Brand Profile */}
      <div className="sidebar-brand">
        <div className="sidebar-avatar">
          <img
            alt="Tournament Logo"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdWldoXllQwdrySIx_xXG2zI-MBGCKPEWbL_dP_4bS1VhgoZf9H8B5PNEiyO3Qj1jpqYNCrlnoSYkh2udyyxqCQUpM72NjV2OLcOJU-nHVusbRW-u92ZiuFiRozC3RlCKdIm1Uzk4DWUA4opwRYwyp2k_-RPzUtiJoRrLq5yCSNRmguAYC-kKtugdBWOwtKtw6QgtVWC-9c3CW1cnLWSbIMmvf-EazmiGbWa_4zawQXRp_lrK3gHU5TOO4ND7ppiwp8nYH0ZOn"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        <h2 className="ho-font-epilogue fs-6 fw-bold text-center mb-1" style={{ color: 'var(--ho-accent-gold-hover)' }}>
          Royal Ascot Series
        </h2>
        <p className="text-center uppercase" style={{ color: 'var(--ho-primary-light)', fontSize: '10px', letterSpacing: '0.1em' }}>
          Elite Tier
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-grow-1 overflow-y-auto no-scrollbar px-2 d-flex flex-column gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
              className={`sidebar-link ${
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }`}
            >
              <span className="material-symbols-outlined me-3 fs-5">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </div>

      {/* Footer Nav Links */}
      <div className="px-2 pb-3 pt-3 border-top d-flex flex-column gap-1" style={{ borderColor: 'var(--ho-primary-medium)' }}>
        <a
          className="sidebar-link sidebar-link-inactive"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Support is available at support@equineelite.com");
          }}
        >
          <span className="material-symbols-outlined me-3 fs-5">help</span>
          Support
        </a>
        <a
          className="sidebar-link sidebar-link-inactive"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          <span className="material-symbols-outlined me-3 fs-5">logout</span>
          Logout
        </a>
      </div>
    </nav>
  );
}
