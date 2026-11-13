import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Menu, X, User, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* TOP INFORMATION BAR */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <a href="tel:+919251273070">
              <Phone size={14} color="var(--brand-orange)" /> +91 9251273070
            </a>
            <a href="tel:+916375273070">
              <Phone size={14} color="var(--brand-orange)" /> +91 6375273070
            </a>
            <a href="mailto:Historypackersandmovers@gmail.com">
              <Mail size={14} color="var(--brand-orange)" /> Historypackersandmovers@gmail.com
            </a>
          </div>
          <div className="top-bar-right">
            <span>
              <MapPin size={14} color="var(--brand-orange)" /> Dhawas, Jaipur, Rajasthan
            </span>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <header className="main-header">
        <div className="container header-inner">
          <Logo height={52} />

          {/* Desktop Nav Items */}
          <nav>
            <ul className="nav-menu">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Work Gallery
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Action Buttons */}
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="btn-header-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/account"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <User size={16} />
                  <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Log out"
                  style={{ padding: '0.4375rem 0.5rem' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm btn-header-auth" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={16} /> Sign In
              </Link>
            )}

            <Link to="/quote" className="btn btn-primary btn-sm btn-header-quote">
              Get Free Quote <ArrowRight size={16} />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1500,
            display: 'flex',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: 'min(285px, 86vw)',
              backgroundColor: '#FFFFFF',
              height: '100%',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <Logo height={42} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-navy)' }}
              >
                <X size={24} />
              </button>
            </div>

            <nav style={{ flex: 1 }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600, fontSize: '1rem' }}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600, fontSize: '1rem' }}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/services" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600, fontSize: '1rem' }}>
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600, fontSize: '1rem' }}>
                    Work Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600, fontSize: '1rem' }}>
                    Contact Us
                  </Link>
                </li>
                <li style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600, color: 'var(--brand-navy)' }}
                      >
                        My Account Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0.5rem 0',
                          fontWeight: 600,
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0', fontWeight: 600 }}>
                      Customer Sign In
                    </Link>
                  )}
                </li>
              </ul>
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/quote" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Get Free Quote
              </Link>
              <a href="tel:+919251273070" className="btn btn-outline" style={{ width: '100%' }}>
                <Phone size={16} /> Call +91 9251273070
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

