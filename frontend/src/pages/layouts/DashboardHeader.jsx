import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function DashboardHeader({ user, profile, navLinks, logout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    // If owner, redirect to profile route, else no-op or alert
    if (user?.role === 'HORSE_OWNER') {
      navigate('/owner/profile');
    } else {
      alert(`${user?.role} profile is under development`);
    }
  };

  const handleFeedbackClick = () => {
    setDropdownOpen(false);
    alert('Feedback page is under development');
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="dashboard-layout-header ho-wrapper w-100 position-relative">
      <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between h-100">
        
        {/* Brand Title & Hamburger Toggle */}
        <div className="d-flex align-items-center gap-3">
          <button 
            className="d-xl-none btn border-0 p-1 d-flex align-items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#ffffff' }}
          >
            <span className="material-symbols-outlined fs-3">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          
          <h1 
            className="ho-font-epilogue fs-5 fw-extrabold m-0 cursor-pointer" 
            style={{ color: 'var(--ho-accent-gold-hover, #fed65b)', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            EquineElite Pro
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="d-none d-xl-flex align-items-center gap-2 flex-grow-1 justify-content-center mx-4">
          {navLinks && navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `nav-link-horizontal ${isActive ? 'nav-link-horizontal-active' : 'nav-link-horizontal-inactive'}`
              }
            >
              {link.icon && <span className="material-symbols-outlined me-1 fs-6">{link.icon}</span>}
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Notifications */}
          <button
            className="ho-btn-light position-relative"
            style={{ width: '36px', height: '36px' }}
            onClick={() => alert("No new notifications")}
          >
            <span className="material-symbols-outlined text-dark" style={{ fontSize: '20px' }}>notifications</span>
            <span className="position-absolute bg-danger border border-white rounded-circle" style={{ top: '6px', right: '6px', width: '8px', height: '8px' }} />
          </button>



          {/* User profile avatar */}
          <div className="avatar-dropdown-container" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="d-flex align-items-center gap-2 gap-sm-3 border-start ps-2 ps-sm-3"
              style={{ borderColor: 'var(--ho-border-muted)', cursor: 'pointer' }}
            >
              <div className="d-flex flex-column text-end d-none d-sm-flex">
                <span className="fs-7 fw-bold text-dark lh-sm">
                  {profile?.fullName || user?.fullName || 'User Profile'}
                </span>
                <span className="ho-font-grotesk fw-bold text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em' }}>
                  {user?.role || 'User'}
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

            {dropdownOpen && (
              <div className="avatar-dropdown-menu">
                <div className="avatar-dropdown-header">Account Actions</div>
                
                <button className="avatar-dropdown-item" onClick={handleProfileClick}>
                  <span className="material-symbols-outlined avatar-dropdown-icon">person</span>
                  My Profile
                </button>
                
                <button className="avatar-dropdown-item" onClick={handleFeedbackClick}>
                  <span className="material-symbols-outlined avatar-dropdown-icon">rate_review</span>
                  Feedback
                </button>
                
                <div className="avatar-dropdown-divider" />
                
                <button className="avatar-dropdown-item logout" onClick={handleLogoutClick}>
                  <span className="material-symbols-outlined avatar-dropdown-icon text-danger">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu d-xl-none w-100 position-absolute bg-white shadow border-top py-2 px-3 ho-font-grotesk" style={{ left: 0, top: '100%', zIndex: 1000 }}>
          <div className="d-flex flex-column gap-2">
            {navLinks && navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `mobile-nav-link p-2 rounded d-flex align-items-center ${isActive ? 'bg-warning text-dark fw-bold' : 'text-dark'}`
                }
                style={{ textDecoration: 'none' }}
              >
                {link.icon && <span className="material-symbols-outlined me-2 fs-5">{link.icon}</span>}
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2" />
            <button 
              className="btn btn-outline-danger btn-sm text-start d-flex align-items-center gap-2 p-2 w-100"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
            >
              <span className="material-symbols-outlined fs-5">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
