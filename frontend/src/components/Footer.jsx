import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, Shield, Clock, CheckCircle } from 'lucide-react';
import Logo from './Logo';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: About & Logo */}
          <div className="footer-col">
            <div style={{ marginBottom: '1.25rem', backgroundColor: '#FFFFFF', display: 'inline-block', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
              <Logo height={44} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9375rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              History Packers & Movers is your reliable partner for household shifting, vehicle transport, and corporate relocation in Jaipur, Rajasthan, and across India. Experience safe handling, professional packing, and dependable transportation.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/919251273070?text=Hello%20History%20Packers%20and%20Movers,%20I%20would%20like%20to%20get%20a%20quotation."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ backgroundColor: '#25D366', color: '#FFFFFF', border: 'none' }}
              >
                <MessageSquare size={16} /> WhatsApp Us
              </a>
              <a href="tel:+919251273070" className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
                <Phone size={16} /> Call Now
              </a>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="footer-col">
            <h4>Our Relocation Services</h4>
            <ul>
              <li><Link to="/services/home-relocation">Home Relocation</Link></li>
              <li><Link to="/services/car-transportation">Car Transportation</Link></li>
              <li><Link to="/services/two-wheeler-transportation">Two-Wheeler Transportation</Link></li>
              <li><Link to="/services/office-relocation">Office Relocation</Link></li>
              <li><Link to="/services/shop-relocation">Shop Relocation</Link></li>
              <li><Link to="/services/packing-and-moving">Packing & Moving</Link></li>
              <li><Link to="/services/loading-and-unloading">Loading & Unloading</Link></li>
              <li><Link to="/services/door-to-door-transportation">Door-to-Door Delivery</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Our Company</Link></li>
              <li><Link to="/services">All Services</Link></li>
              <li><Link to="/gallery">Work Gallery</Link></li>
              <li><Link to="/quote">Get Free Quotation</Link></li>
              <li><Link to="/contact">Contact & Location</Link></li>
              <li><Link to="/login">Customer Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Verified Contact Info */}
          <div className="footer-col">
            <h4>Contact Details</h4>
            <div className="footer-contact-item">
              <MapPin size={20} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '0.25rem' }}>Jaipur Central Office:</strong>
                <span style={{ color: '#CBD5E1', lineHeight: 1.5 }}>
                  SHOP NO 05 BASEMENT PLOT NO R 3/42, INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, JAIPUR, RAJASTHAN, INDIA.
                </span>
              </div>
            </div>

            <div className="footer-contact-item">
              <Phone size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.375rem' }}>
                <a href="tel:+919251273070">+91 9251273070</a>
                <span style={{ color: '#64748B' }}>|</span>
                <a href="tel:+916375273070">+91 6375273070</a>
              </div>
            </div>

            <div className="footer-contact-item">
              <Mail size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
              <div>
                <a href="mailto:Historypackersandmovers@gmail.com" style={{ wordBreak: 'break-all' }}>Historypackersandmovers@gmail.com</a>
              </div>
            </div>

            <div className="footer-contact-item">
              <Clock size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
              <span style={{ color: '#CBD5E1' }}>Mon - Sun: 8:00 AM - 9:00 PM (Daily Support)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} History Packers & Movers. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/about" style={{ color: '#94A3B8' }}>Verified Relocation Services</Link>
            <Link to="/contact" style={{ color: '#94A3B8' }}>Jaipur, Rajasthan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

