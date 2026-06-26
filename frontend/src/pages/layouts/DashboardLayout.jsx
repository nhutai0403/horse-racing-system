import React, { useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import Footer from '../../components/Footer/Footer';
import './DashboardLayout.css';

export default function DashboardLayout({ navLinks, profile, children }) {
  const { user, logout } = useContext(AuthContext);

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
        {/* Left Sidebar for Admin */}
        {user?.role === 'ADMIN' && (
          <aside className="admin-sidebar d-none d-xl-flex flex-column bg-white py-4" style={{ width: '260px', minHeight: 'calc(100vh - 80px)', flexShrink: 0 }}>
            <div className="px-3 d-flex flex-column gap-1">
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
          </aside>
        )}

        {/* Main content body */}
        <main className="flex-grow-1 p-4 p-md-5" style={{ minHeight: 'calc(100vh - 80px)', overflowX: 'hidden' }}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
