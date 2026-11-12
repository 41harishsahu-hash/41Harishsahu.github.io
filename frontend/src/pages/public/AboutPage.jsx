import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Clock, Truck, Users, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Banner */}
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '4rem 0' }}>
        <div className="container">
          <span style={{ color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: '0.8125rem' }}>
            About History Packers & Movers
          </span>
          <h1 style={{ color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Safe, Dependable & Customer-First Relocation
          </h1>
          <p style={{ color: '#E2E8F0', maxWidth: '650px', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Headquartered in Jaipur, Rajasthan, we specialize in delivering secure household shifting, vehicle transport, and corporate logistics with precision and care.
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="section-subtitle">Our Background</span>
              <h2 style={{ marginBottom: '1.25rem' }}>Who We Are & What Drives Us</h2>
              <p style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
                <strong>History Packers & Movers</strong> was established to bring accountability, transparency, and high service quality to the relocation industry. Shifting homes or offices is one of life's major milestones, and our objective is to ensure you experience zero stress throughout the process.
              </p>
              <p style={{ marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Operating from our hub in Dhawas, Jaipur, we manage local shifting within Rajasthan as well as long-distance moves across Indian metropolitan hubs. Our methodology relies on standardized multi-layer packing, trained personnel, and covered vehicles designed specifically to protect furniture, appliances, and delicate valuables.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ borderLeft: '3px solid var(--brand-orange)', paddingLeft: '1rem' }}>
                  <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>Our Mission</h4>
                  <p style={{ fontSize: '0.875rem' }}>Deliver flawless door-to-door shifting using premier materials and respectful, expert personnel.</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--brand-orange)', paddingLeft: '1rem' }}>
                  <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>Our Philosophy</h4>
                  <p style={{ fontSize: '0.875rem' }}>Honest pricing, careful handling, and punctual timelines with open customer communication.</p>
                </div>
              </div>
            </div>

            {/* Business Details Card */}
            <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--brand-navy)' }}>Verified Business Profile</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={20} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)' }}>Central Office Address:</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      SHOP NO 05 BASEMENT PLOT NO R 3/42, INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, JAIPUR, RAJASTHAN, INDIA.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Phone size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)' }}>Direct Phone Lines:</strong>
                    <span>+91 9251273070 / +91 6375273070</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Mail size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)' }}>Official Email:</strong>
                    <span>Historypackersandmovers@gmail.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Truck size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)' }}>Fleet & Operations:</strong>
                    <span>Covered household trucks, dedicated car carriers, two-wheeler specialized crates</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Link to="/quote" className="btn btn-primary" style={{ width: '100%' }}>
                  Request Free Moving Estimate <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Customer Commitment */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Safety & Standards</span>
            <h2 className="section-title">Our Strict Moving Protocols</h2>
            <p className="section-desc">We follow systematic packing and transit standards to safeguard your possessions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <Shield size={32} color="var(--brand-orange)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Quality Packing Materials</h3>
              <p style={{ fontSize: '0.875rem' }}>
                We use high-density 5-ply corrugated sheets, thick bubble wraps, corner guards for glassware, and water-resistant shrink wraps.
              </p>
            </div>

            <div className="card">
              <Users size={32} color="var(--brand-orange)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Trained Labor & Drivers</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Our team members are experienced full-time professionals who handle loading, lifting, and road transit with utmost discipline.
              </p>
            </div>

            <div className="card">
              <Clock size={32} color="var(--brand-orange)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Schedule Accountability</h3>
              <p style={{ fontSize: '0.875rem' }}>
                We adhere to agreed arrival windows and provide direct transit coordination with the driver until your items are safely unloaded.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

