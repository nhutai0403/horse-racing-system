import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminHeader({ user, profile, navLinks, logout }) {
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
    navigate('/admin/dashboard');
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
    <header 
      className="dashboard-layout-header w-100 position-sticky top-0"
      style={{
        backgroundColor: 'var(--ho-primary-dark, #003820)',
        borderBottom: '1px solid var(--ho-accent-gold, rgba(212, 175, 55, 0.3))',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
        height: '80px',
        zIndex: 1020,
        position: 'sticky',
        top: 0
      }}
    >
      <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between h-100">
        
        {/* Brand Title & Hamburger Toggle */}
        <div className="d-flex align-items-center gap-3 flex-shrink-0">
          <button 
            className="d-xl-none btn border-0 p-1 d-flex align-items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#ffffff' }}
          >
            <span className="material-symbols-outlined fs-3">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          
          <>
            <h1 
              className="ho-font-epilogue fs-5 fw-extrabold m-0 d-none d-xl-block" 
              style={{ color: 'var(--ho-accent-gold-hover, #fed65b)' }}
            >
              System Management Console
            </h1>
            <h1 
              className="ho-font-epilogue fs-5 fw-extrabold m-0 d-xl-none cursor-pointer" 
              style={{ color: 'var(--ho-accent-gold-hover, #fed65b)', cursor: 'pointer' }}
              onClick={() => navigate('/admin/dashboard')}
            >
              Admin Portal
            </h1>
          </>
        </div>

        {/* Center Search Bar */}
        <div className="d-none d-md-flex align-items-center position-relative mx-3" style={{ maxWidth: '360px', width: '100%' }}>
          <span className="material-symbols-outlined position-absolute text-white-50" style={{ fontSize: '18px', left: '14px' }}>
            search
          </span>
          <input
            type="text"
            className="form-control rounded-pill border-0 text-white"
            placeholder="Search panels, users, tournaments..."
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '13px',
              paddingLeft: '40px',
              height: '38px',
              width: '100%',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.target.style.border = '1px solid var(--ho-accent-gold, #D4AF37)';
              e.target.style.boxShadow = '0 0 0 1px var(--ho-accent-gold, #D4AF37)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-2 gap-sm-3 flex-shrink-0">
          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="ho-btn-light position-relative d-flex align-items-center justify-content-center"
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              padding: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            title="Notifications"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ffffff' }}>notifications</span>
            <span 
              className="position-absolute bg-warning rounded-circle" 
              style={{ top: '2px', right: '2px', width: '6px', height: '6px' }}
            />
          </button>

          {/* User profile avatar */}
          <div className="avatar-dropdown-container" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="d-flex align-items-center gap-2 gap-sm-3 border-start ps-2 ps-sm-3"
              style={{ borderColor: 'rgba(255, 255, 255, 0.15)', cursor: 'pointer' }}
            >
              <div className="d-flex flex-column text-end d-none d-sm-flex">
                <span className="fs-7 fw-bold lh-sm" style={{ color: '#ffffff' }}>
                  {profile?.fullName || user?.fullName || 'System Admin'}
                </span>
                <span className="ho-font-grotesk fw-bold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em', color: 'var(--ho-primary-light, #95d4ac)' }}>
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <div 
                className="rounded-circle overflow-hidden border cursor-pointer d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px', borderColor: 'var(--ho-accent-gold, #D4AF37)' }}
              >
                <img
                  alt="User Profile Avatar"
                  className="w-100 h-100 object-fit-cover"
                  src={profile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"}
                />
              </div>
            </div>

            {dropdownOpen && (
              <div className="avatar-dropdown-menu" style={{ backgroundColor: '#ffffff' }}>
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
