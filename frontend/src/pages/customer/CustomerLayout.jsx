import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CalendarCheck, User, LogOut, PlusCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div style={{ marginBottom: '1.5rem', padding: '0 0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Welcome back,</div>
          <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
            {user?.name || 'Customer'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
        </div>

        <div className="sidebar-title">Customer Portal</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/account" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/account/enquiries" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> My Enquiries
            </NavLink>
          </li>
          <li>
            <NavLink to="/account/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CalendarCheck size={18} /> My Bookings
            </NavLink>
          </li>
          <li>
            <NavLink to="/account/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={18} /> Profile & Password
            </NavLink>
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/quote" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            <PlusCircle size={16} /> New Quote Request
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--border-color)' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;

