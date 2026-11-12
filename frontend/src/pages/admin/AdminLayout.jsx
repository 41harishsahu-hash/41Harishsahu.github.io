import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Users,
  Truck,
  MessageSquare,
  Globe,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Camera,
  Sliders,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const closeDrawer = () => setMobileOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile Top Header (<= 768px) */}
      <header className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open Admin Menu"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.375rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Menu size={22} />
          </button>
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
            <Logo height={26} />
          </div>
        </div>

        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: 'var(--brand-orange)',
            backgroundColor: 'rgba(242, 140, 40, 0.15)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}
        >
          ADMIN PANEL
        </span>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="admin-drawer-overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.375rem 0.625rem', borderRadius: '6px' }}>
            <Logo height={32} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--brand-orange)',
                backgroundColor: 'rgba(242, 140, 40, 0.15)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              ADMIN
            </span>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close Admin Menu"
              className="mobile-close-btn"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'none', // Overridden to flex on mobile via CSS
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="sidebar-title">Core Management</div>
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/admin/dashboard"
              end
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/enquiries"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} /> Enquiries
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bookings"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CalendarCheck size={18} /> Bookings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/customers"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} /> Customers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/services"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Truck size={18} /> Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/gallery"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Camera size={18} /> Work Gallery
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/carousel"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Sliders size={18} /> Hero Carousel
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/content"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Globe size={18} /> Content & FAQs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/settings"
              onClick={closeDrawer}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Settings size={18} /> Settings & Profile
            </NavLink>
          </li>
        </ul>

        {/* Sidebar Footer Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ color: '#CBD5E1', borderColor: '#334155', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
          >
            <ExternalLink size={14} /> View Public Website
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-sm"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
          >
            <LogOut size={16} /> Admin Sign Out
          </button>
        </div>
      </aside>

      {/* Admin Main Content Area (Scrolls independently) */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
