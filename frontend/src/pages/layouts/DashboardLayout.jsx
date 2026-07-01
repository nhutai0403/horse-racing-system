import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import Footer from '../../components/Footer/Footer';
import './DashboardLayout.css';
import logo from '../../assets/logo.png';

export default function DashboardLayout({ navLinks, profile, children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';
  const isHomePage = location.pathname.endsWith('/home') || location.pathname === '/';

  if (isAdmin) {
    return (
      <div className="admin-layout-container d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: 'var(--ho-bg-cream, #f6f3f2)' }}>
        {/* Admin Header */}
        <AdminHeader 
          user={user} 
          profile={profile} 
          navLinks={navLinks} 
          logout={logout} 
        />

        <div className="d-flex flex-grow-1 w-100 position-relative">
          {/* Left Sidebar for Admin (Desktop only) */}
          <aside className="admin-sidebar d-none d-xl-flex flex-column py-4 flex-shrink-0" style={{ width: '260px', height: 'calc(100vh - 80px)', position: 'sticky', top: '80px' }}>
            {/* Logo / Branding in Sidebar */}
            <div className="px-4 mb-3 pb-3 border-bottom admin-sidebar-brand-wrapper d-flex justify-content-center align-items-center">
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <img src={logo} alt="EquineElite Logo" style={{ height: '60px', width: 'auto' }} />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="px-3 d-flex flex-column gap-1 flex-grow-1 overflow-y-auto no-scrollbar">
              {navLinks && navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => 
                    `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link-inactive'}`
                  }
                >
                  {link.icon && <span className="material-symbols-outlined fs-5">{link.icon}</span>}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Logout button at the bottom */}
            <div className="px-3 mt-auto pt-3 border-top admin-sidebar-footer">
              <button 
                className="btn btn-outline-danger btn-sm text-start d-flex align-items-center gap-2 p-2 w-100 rounded-3 admin-sidebar-logout-btn"
                onClick={logout}
              >
                <span className="material-symbols-outlined fs-5">logout</span>
                Logout
              </button>
            </div>
          </aside>

          {/* Right side container: Main Content + Footer */}
          <div className="d-flex flex-column flex-grow-1 position-relative" style={{ overflowX: 'hidden', minHeight: 'calc(100vh - 80px)' }}>
            <main className={`flex-grow-1 ${isHomePage ? 'p-0' : 'p-4 p-md-5'}`} style={{ overflowX: 'hidden' }}>
              {children || <Outlet />}
            </main>

            <AdminFooter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-container d-flex flex-column min-vh-100 w-100" style={{ backgroundColor: 'var(--ho-bg-cream, #f6f3f2)' }}>
      {/* Reusable top header */}
      <DashboardHeader 
        user={user} 
        profile={profile} 
        navLinks={navLinks} 
        logout={logout} 
      />

      <div className="d-flex flex-grow-1 w-100 position-relative">
        {/* Main content body */}
        <main className={`flex-grow-1 ${isHomePage ? 'p-0' : 'p-4 p-md-5'}`} style={{ minHeight: 'calc(100vh - 80px)', overflowX: 'hidden' }}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
