import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getConnectionsDirectoryAPI } from '../../services/connections';
import { getJockeyInvitationsAPI } from '../../services/jockey';
import { AuthContext } from '../../contexts/AuthContext';
import axiosClient from '../../api/axiosClient';
import logo from '../../assets/logo.png';

export default function DashboardHeader({ user, profile, navLinks, logout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState([]);
  
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { refreshToken, login } = useContext(AuthContext);

  const handleActivateRole = async (requestedRole) => {
    try {
      const refreshResponse = await axiosClient.post('/auth/refresh', {
        refreshToken: refreshToken,
      });
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
      
      localStorage.setItem('horse_racing_accessToken', newAccessToken);
      localStorage.setItem('horse_racing_refreshToken', newRefreshToken);
      
      const profileResponse = await axiosClient.get('/auth/me');
      const updatedUser = profileResponse.data;
      
      login({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: updatedUser,
      });

      if (requestedRole === 'HORSE_OWNER') {
        window.location.href = '/owner';
      } else if (requestedRole === 'JOCKEY') {
        window.location.href = '/jockey';
      } else if (requestedRole === 'RACE_REFEREE') {
        window.location.href = '/referee';
      }
    } catch (err) {
      console.error("Failed to activate new role session:", err);
      alert("Failed to refresh session. Please try logging out and logging back in.");
    }
  };

  const loadNotifications = async () => {
    if (!user) {
      setPendingNotifications([]);
      return;
    }
    try {
      let combinedNotifications = [];

      // 1. Fetch friend requests (both Jockey and Horse Owner roles can receive friend requests)
      if (user.role === 'HORSE_OWNER' || user.role === 'JOCKEY') {
        try {
          const directory = await getConnectionsDirectoryAPI();
          const pendingFriendRequests = directory
            .filter(u => u.friendStatus === 'PENDING_RECEIVED')
            .map(u => ({
              id: `FRIEND_REQ_${u.userId || u.id}`,
              ownerName: u.fullName,
              senderName: u.fullName,
              userId: u.userId || u.id,
              connectionId: u.connectionId,
              type: 'FRIEND_REQUEST'
            }));
          combinedNotifications = [...combinedNotifications, ...pendingFriendRequests];
        } catch (err) {
          console.error('Failed to load connections for notifications:', err);
        }
      }

      // 2. Fetch ride invitations for JOCKEY
      if (user.role === 'JOCKEY') {
        try {
          const invs = await getJockeyInvitationsAPI();
          const pendingRideInvs = invs
            .filter(inv => inv.status === 'PENDING_JOCKEY' || inv.status === 'PENDING')
            .map(inv => ({
              id: `RIDE_INV_${inv.id}`,
              ownerName: inv.ownerName,
              senderName: inv.ownerName,
              horseName: inv.horseName,
              tournamentName: inv.raceName,
              type: 'RIDE_INVITATION'
            }));
          combinedNotifications = [...combinedNotifications, ...pendingRideInvs];
        } catch (err) {
          console.error('Failed to load ride invitations for notifications:', err);
        }
      }

      // 3. Fetch upgrade requests (only for SPECTATOR role)
      if (user.role === 'SPECTATOR') {
        try {
          const response = await axiosClient.get('/upgrade-requests/me');
          const myReqs = response.data;
          if (myReqs && myReqs.length > 0) {
            myReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latestReq = myReqs[0];
            if (latestReq.status === 'APPROVED') {
              combinedNotifications.unshift({
                id: `UPGRADE_APPROVED_${latestReq.id}`,
                type: 'UPGRADE_APPROVED',
                requestedRole: latestReq.requestedRole,
                fullName: latestReq.fullName,
                senderName: 'System',
              });
            }
          }
        } catch (err) {
          console.error('Failed to load upgrade requests for notifications:', err);
        }
      }

      setPendingNotifications(combinedNotifications);
    } catch (e) {
      console.error('Error loading notifications:', e);
      setPendingNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    const handleStorageChange = () => {
      loadNotifications();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('jockey_invitations_updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jockey_invitations_updated', handleStorageChange);
    };
  }, [user, notificationOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (noti) => {
    setNotificationOpen(false);
    if (noti.type === 'UPGRADE_APPROVED') {
      handleActivateRole(noti.requestedRole);
    } else if (noti.type === 'FRIEND_REQUEST') {
      if (user?.role === 'JOCKEY') {
        navigate('/jockey/invitations', { state: { activeTab: 'connections', activeSubTab: 'friend-requests' } });
      } else if (user?.role === 'HORSE_OWNER') {
        navigate('/owner/friends', { state: { activeSubTab: 'friend-requests' } });
      }
    } else if (noti.type === 'RIDE_INVITATION') {
      navigate('/jockey/invitations', { state: { activeTab: 'race-invitations' } });
    }
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    // Redirect based on role
    if (user?.role === 'HORSE_OWNER') {
      navigate('/owner/profile');
    } else if (user?.role === 'JOCKEY') {
      navigate('/jockey/profile');
    } else if (user?.role === 'SPECTATOR') {
      navigate('/spectator/dashboard');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
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
          
          <div 
            className="d-flex align-items-center cursor-pointer"
            onClick={() => {
              if (user?.role === 'RACE_REFEREE') navigate('/referee/home');
              else if (user?.role === 'JOCKEY') navigate('/jockey/home');
              else if (user?.role === 'HORSE_OWNER') navigate('/owner/home');
              else if (user?.role === 'SPECTATOR') navigate('/spectator/home');
              else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
              else navigate('/');
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src={logo} alt="EquineElite Logo" style={{ height: '48px', width: 'auto' }} />
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="d-none d-xl-flex align-items-center gap-2 flex-grow-1 justify-content-center mx-4">
          {navLinks && navLinks.map((link, idx) => (
            link.subLinks ? (
              <div className="nav-dropdown-container position-relative" key={link.label || idx}>
                <div className="nav-link-horizontal nav-link-horizontal-inactive cursor-pointer d-flex align-items-center">
                  {link.icon && <span className="material-symbols-outlined me-1 fs-6">{link.icon}</span>}
                  {link.label}
                  <span className="material-symbols-outlined ms-1" style={{ fontSize: '18px' }}>expand_more</span>
                </div>
                <div className="nav-dropdown-menu">
                  {link.subLinks.map(sub => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) => 
                        `nav-dropdown-item ${isActive ? 'nav-dropdown-item-active' : ''}`
                      }
                    >
                      {sub.icon && <span className="material-symbols-outlined me-2 fs-6">{sub.icon}</span>}
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
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
            )
          ))}
        </div>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Notifications */}
          <div className="avatar-dropdown-container" ref={notificationRef}>
            <button
              className="ho-btn-light position-relative"
              style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}
              onClick={() => setNotificationOpen(!notificationOpen)}
            >
              <span className="material-symbols-outlined text-dark" style={{ fontSize: '20px' }}>notifications</span>
              {pendingNotifications.length > 0 && (
                <span className="position-absolute bg-danger border border-white rounded-circle d-flex align-items-center justify-content-center text-white" 
                      style={{ top: '-4px', right: '-4px', width: '18px', height: '18px', fontSize: '9px', fontWeight: 'bold' }}>
                  {pendingNotifications.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="avatar-dropdown-menu" style={{ width: '320px', right: 0, paddingBottom: 0 }}>
                <div className="avatar-dropdown-header d-flex justify-content-between align-items-center">
                  <span>Notifications ({pendingNotifications.length})</span>
                </div>
                <div className="avatar-dropdown-divider" style={{ marginBottom: 0 }} />
                
                <div className="no-scrollbar" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {pendingNotifications.length === 0 ? (
                    <div className="py-4 text-center text-muted small" style={{ fontStyle: 'italic' }}>
                      No new notifications
                    </div>
                  ) : (
                    pendingNotifications.map((noti) => {
                      const isUpgrade = noti.type === 'UPGRADE_APPROVED';
                      return (
                        <button 
                          key={noti.id} 
                          className="avatar-dropdown-item d-flex flex-column align-items-start gap-1 py-3 px-3 border-bottom"
                          style={{ 
                            borderBottom: '1px solid #edf2f7', 
                            borderTop: 'none', 
                            background: isUpgrade ? 'rgba(16, 185, 129, 0.05)' : 'none', 
                            borderRadius: 0 
                          }}
                          onClick={() => handleNotificationClick(noti)}
                        >
                          <div className="d-flex align-items-center gap-2 w-100">
                            <span className={`material-symbols-outlined ${isUpgrade ? 'text-success' : 'text-warning'}`} style={{ fontSize: '18px' }}>
                              {isUpgrade ? 'check_circle' : noti.type === 'FRIEND_REQUEST' ? 'person' : 'sports_score'}
                            </span>
                            <span className="fw-bold text-dark text-truncate" style={{ fontSize: '12.5px', maxWidth: '200px' }}>
                              {noti.senderName || (isUpgrade ? 'System' : 'Invitation')}
                            </span>
                            <span className={`badge ${isUpgrade ? 'bg-success text-white' : 'bg-warning text-dark'} ms-auto`} style={{ fontSize: '8px', padding: '2px 4px' }}>
                              {isUpgrade ? 'Activate' : 'New'}
                            </span>
                          </div>
                          <p className="text-secondary small m-0 text-truncate-2" style={{ fontSize: '11.5px', lineHeight: '1.4', textAlign: 'left', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal' }}>
                            {isUpgrade 
                              ? `Upgrade request to ${noti.requestedRole.replace('_', ' ')} has been approved. Click here to activate your role!`
                              : noti.type === 'FRIEND_REQUEST' 
                                ? 'sent you a connection request.'
                                : `Invited you to ride ${noti.horseName} at tournament ${noti.tournamentName}`
                            }
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
            {navLinks && navLinks.map((link, idx) => (
              link.subLinks ? (
                <div key={link.label || idx} className="d-flex flex-column gap-1">
                  <div className="p-2 rounded d-flex align-items-center text-dark fw-bold" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    {link.icon && <span className="material-symbols-outlined me-2 fs-5 text-secondary">{link.icon}</span>}
                    {link.label}
                  </div>
                  <div className="d-flex flex-column gap-1 ps-4 border-start border-2 ms-2" style={{ borderColor: 'var(--ho-accent-gold) !important' }}>
                    {link.subLinks.map(sub => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => 
                          `mobile-nav-link p-2 rounded d-flex align-items-center ${isActive ? 'bg-warning text-dark fw-bold' : 'text-dark'}`
                        }
                        style={{ textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        {sub.icon && <span className="material-symbols-outlined me-2" style={{fontSize: '18px'}}>{sub.icon}</span>}
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
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
              )
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
