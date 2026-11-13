import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Home,
  Car,
  Bike,
  Building,
  Store,
  Package,
  MapPin,
  Star,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Camera,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { contentAPI } from '../../services/api';
import { GalleryLightbox } from '../../components/GalleryLightbox';
import { HeroCarousel } from '../../components/HeroCarousel';
import { getValidImageUrl, onImageErrorFallback } from '../../utils/imageHelper';

const SERVICE_ICONS = {
  Home: Home,
  Car: Car,
  Bike: Bike,
  Building: Building,
  Store: Store,
  Package: Package,
  Truck: Truck,
};

const DEFAULT_HERO_SLIDES = [
  {
    title: 'Professional Household & Commercial Fleet',
    description: 'Expert packing, safe container loading, and dedicated logistics fleet.',
    imageUrl: '/images/hero/hero-1.svg',
  },
  {
    title: 'Dedicated Vehicle Carriers & Pan-India Logistics',
    description: 'Specialized covered vehicle carriers ensuring scratch-free car and two-wheeler transit.',
    imageUrl: '/images/hero/hero-2.svg',
  },
  {
    title: 'Direct Doorstep Relocation Delivery',
    description: 'Careful loading, smooth highway transit, and prompt unloading in every city.',
    imageUrl: '/images/hero/hero-3.svg',
  },
];

export const HomePage = () => {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    // Fetch dynamic content from backend
    contentAPI.getHeroCarousel()
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setHeroSlides(res.data.data);
        }
      })
      .catch(() => {});

    contentAPI.getServices()
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setServices(res.data.data);
        }
      })
      .catch(() => {});

    contentAPI.getGallery()
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setGallery(res.data.data);
        }
      })
      .catch(() => {});

    contentAPI.getTestimonials()
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setTestimonials(res.data.data);
        }
      })
      .catch(() => {});

    contentAPI.getFAQs()
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setFaqs(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="homepage">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        {/* Dynamic Background Image Carousel */}
        <HeroCarousel slides={heroSlides} />

        <div className="container hero-container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content-wrapper" style={{ maxWidth: '640px' }}>
            <span className="section-subtitle">Jaipur Relocation Specialists</span>
            <h1 className="hero-heading" style={{ marginBottom: '1.25rem', color: 'var(--brand-navy)' }}>
              Moving Made Simple. <br />
              <span style={{ color: 'var(--brand-orange)' }}>Moving Made Safe.</span>
            </h1>
            <p className="hero-description" style={{ fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '540px', lineHeight: 1.6 }}>
              Reliable packing and moving solutions for your home, office and vehicle. Experience safe handling, professional packing and dependable transportation.
            </p>

            <div className="hero-cta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <Link to="/quote" className="btn btn-primary btn-lg hero-btn-quote">
                Get Free Quote <ArrowRight size={18} />
              </Link>
              <a href="tel:+919251273070" className="btn btn-navy btn-lg hero-btn-call">
                <Phone size={18} /> Call Now
              </a>
            </div>

            {/* Trust Badges */}
            <div className="hero-trust-badges">
              <div className="hero-trust-item">
                <Shield size={18} color="var(--brand-orange)" className="hero-trust-icon" />
                <span>Multi-Layer Packing</span>
              </div>
              <div className="hero-trust-item">
                <Clock size={18} color="var(--brand-orange)" className="hero-trust-icon" />
                <span>On-Time Transit</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle size={18} color="var(--brand-orange)" className="hero-trust-icon" />
                <span>Zero Hidden Costs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Compact "Calculate Free Estimate" Button */}
        <Link
          to="/quote"
          className="hero-estimate-floating-btn"
          aria-label="Calculate Free Estimate"
        >
          <Calculator size={18} className="hero-estimate-icon" />
          <span>Calculate Free Estimate</span>
        </Link>
      </section>

      {/* 2. SERVICES OVERVIEW */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Our Expertise</span>
            <h2 className="section-title">Comprehensive Relocation Services</h2>
            <p className="section-desc">
              From delicate household items to luxury vehicles and corporate IT setups, we handle every relocation with safety and precision.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
            {(services.length > 0 ? services : defaultServices).map((service) => {
              const IconComp = SERVICE_ICONS[service.icon] || Truck;
              return (
                <div key={service.slug} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(242, 140, 40, 0.1)',
                      color: 'var(--brand-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1875rem', marginBottom: '0.5rem' }}>{service.title}</h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1 }}>{service.shortDescription}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <Link to={`/services/${service.slug}`} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                      Learn More →
                    </Link>
                    <Link to="/quote" className="btn btn-outline btn-sm">
                      Get Quote
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FOUR-STEP RELOCATION PROCESS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">How It Works</span>
            <h2 className="section-title">A Seamless 4-Step Shifting Process</h2>
            <p className="section-desc">
              We take the stress out of moving with a structured, transparent process from initial estimate to final doorstep delivery.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 800 }}>
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Request Quote</h3>
              <p style={{ fontSize: '0.875rem' }}>Share your pickup and drop locations, moving date, and items list for a transparent estimate.</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 800 }}>
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Survey & Plan</h3>
              <p style={{ fontSize: '0.875rem' }}>We evaluate volume, assign appropriate packing materials, and schedule our dedicated relocation crew.</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 800 }}>
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Multi-Layer Packing</h3>
              <p style={{ fontSize: '0.875rem' }}>Items are carefully packed with corrugated sheets, bubble wrap, and loaded safely into covered trucks.</p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 800 }}>
                4
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Safe Door Delivery</h3>
              <p style={{ fontSize: '0.875rem' }}>Timely transport, gentle unloading, and placing heavy furniture directly in your designated rooms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <span className="section-subtitle">Why History Packers & Movers</span>
              <h2 style={{ marginBottom: '1rem' }}>Relocation Built on Care, Punctuality & Trust</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                We understand that every item we move holds personal or commercial value. Our moving team focuses strictly on safety standards, verified handling procedures, and clear communication.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ color: 'var(--brand-navy)' }}>Trained & Background-Checked Crew:</strong>
                    <p style={{ fontSize: '0.875rem' }}>Respectful, experienced moving specialists trained in proper lifting and wrapping protocols.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ color: 'var(--brand-navy)' }}>Industry-Grade Packing Supplies:</strong>
                    <p style={{ fontSize: '0.875rem' }}>Heavy-duty 5-ply cartons, thermocol sheets, stretch wrap, and edge protectors for total safety.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ color: 'var(--brand-navy)' }}>Direct Door-to-Door Transportation:</strong>
                    <p style={{ fontSize: '0.875rem' }}>Your goods stay in the designated vehicle without transshipment handling or offloading risks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-responsive-pad" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', minWidth: 0 }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--brand-navy)' }}>Key Service Highlights</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-orange)' }}></div>
                  <span>Local shifting anywhere in Jaipur (Mansarovar, Vaishali Nagar, Malviya Nagar, etc.)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-orange)' }}></div>
                  <span>Rajasthan statewide connectivity (Jodhpur, Udaipur, Kota, Ajmer, Bikaner)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-orange)' }}></div>
                  <span>Pan-India express logistics (Delhi NCR, Mumbai, Pune, Bangalore, Hyderabad)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-orange)' }}></div>
                  <span>Dedicated car & motorcycle carriers with hydraulic safety ramps</span>
                </li>
              </ul>

              <div className="highlights-btn-group">
                <Link to="/contact" className="btn btn-navy highlights-btn">
                  Contact Jaipur Hub
                </Link>
                <Link to="/quote" className="btn btn-primary highlights-btn">
                  Get Free Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WORK GALLERY SECTION */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <Camera size={16} /> Verified Operations
            </span>
            <h2 className="section-title">Our Recent Moves & Work Gallery</h2>
            <p className="section-desc">
              Genuine on-the-ground photographs of household shifting, furniture packaging, vehicle transportation, and corporate relocations handled by our crew.
            </p>
          </div>

          {gallery.length === 0 ? (
            <div
              className="card"
              style={{
                maxWidth: '620px',
                margin: '0 auto',
                textAlign: 'center',
                padding: '3rem 2rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(23, 54, 93, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  color: 'var(--brand-navy)',
                }}
              >
                <ImageIcon size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                Verified Projects Being Cataloged
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                We are currently cataloging high-resolution moving photos from recent residential and commercial shifts. All client identities are safeguarded for privacy.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                <Link to="/services" className="btn btn-navy btn-sm">
                  Explore Services
                </Link>
                <Link to="/quote" className="btn btn-primary btn-sm">
                  Request Free Moving Quote
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '1.75rem',
                  marginBottom: '2.5rem',
                }}
              >
                {gallery.slice(0, 6).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="card gallery-card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#FFFFFF',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '66.66%',
                        backgroundColor: '#F1F5F9',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={getValidImageUrl(item.imageUrl, 'gallery')}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => onImageErrorFallback(e, 'gallery')}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          left: '0.75rem',
                          backgroundColor: 'rgba(23, 54, 93, 0.9)',
                          color: '#FFFFFF',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.category || 'Relocation'}
                      </span>
                    </div>

                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={12} color="var(--brand-orange)" /> {item.location}
                          </span>
                        )}
                        {item.projectDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {new Date(item.projectDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.375rem', lineHeight: 1.3 }}>
                        {item.title}
                      </h3>

                      {item.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                          {item.description}
                        </p>
                      )}

                      <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          View Photo <ExternalLink size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link to="/gallery" className="btn btn-navy btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  View All Projects & Work Gallery <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER TESTIMONIALS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Real Experiences</span>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-desc">Read genuine feedback from families and businesses who relocated with History Packers & Movers.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {(testimonials.length > 0 ? testimonials : defaultTestimonials).map((t, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.9375rem', marginBottom: '1.25rem', flex: 1, color: 'var(--text-primary)' }}>
                  "{t.comment}"
                </p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <strong style={{ display: 'block', color: 'var(--brand-navy)' }}>{t.name}</strong>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {t.location} • <span style={{ color: 'var(--brand-orange)' }}>{t.serviceUsed}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQS */}
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header">
            <span className="section-subtitle">Common Questions</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">Everything you need to know about packing, transport and pricing.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(faqs.length > 0 ? faqs : defaultFaqs).map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="card"
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: isExpanded ? 'var(--brand-orange)' : 'var(--brand-navy)' }}>
                      {faq.question}
                    </h3>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  {isExpanded && (
                    <p style={{ marginTop: '0.75rem', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL QUOTE CTA BANNER */}
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Ready for a Smooth, Worry-Free Move?</h2>
          <p style={{ color: '#E2E8F0', fontSize: '1.0625rem', marginBottom: '2rem' }}>
            Get an instant, transparent relocation quotation tailored to your moving schedule and goods volume.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/quote" className="btn btn-primary btn-lg">
              Get Your Free Quotation <ArrowRight size={18} />
            </Link>
            <a href="tel:+919251273070" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}>
              <Phone size={18} /> Speak With Shifting Expert
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={gallery}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </div>
  );
};

const defaultServices = [
  { title: 'Home Relocation', slug: 'home-relocation', icon: 'Home', shortDescription: 'Complete household shifting with multi-layer protective packaging for your furniture and electronics.' },
  { title: 'Car Transportation', slug: 'car-transportation', icon: 'Car', shortDescription: 'Enclosed vehicle carriers with hydraulic ramps and wheel-stoppers for scratch-free national delivery.' },
  { title: 'Two-Wheeler Transportation', slug: 'two-wheeler-transportation', icon: 'Bike', shortDescription: 'Scratch-proof corrugated bubble packing and rigid fastening for bikes and scooters.' },
  { title: 'Office Relocation', slug: 'office-relocation', icon: 'Building', shortDescription: 'Planned commercial and corporate moving with minimal business downtime and IT packing.' },
  { title: 'Shop Relocation', slug: 'shop-relocation', icon: 'Store', shortDescription: 'Fast retail store and showroom shifting for inventory, display counters, and racks.' },
  { title: 'Packing and Moving', slug: 'packing-and-moving', icon: 'Package', shortDescription: 'End-to-end relocation combining premium 5-ply cartons with trained moving specialists.' },
  { title: 'Loading and Unloading', slug: 'loading-and-unloading', icon: 'Truck', shortDescription: 'Skilled physical labor using lifting dollies and safety blankets to prevent scuffs.' },
  { title: 'Door-to-Door Transportation', slug: 'door-to-door-transportation', icon: 'Truck', shortDescription: 'Direct highway transit with no intermediate warehouse offloading across India.' },
];

const defaultTestimonials = [
  {
    name: 'Vikas Shekhawat',
    location: 'Jaipur to Delhi',
    rating: 5,
    comment: 'History Packers & Movers handled our 3 BHK shifting to Delhi with absolute care. The packing staff was polite and well trained. All electronics arrived without a single scratch.',
    serviceUsed: 'Home Relocation',
  },
  {
    name: 'Pooja Agarwal',
    location: 'Mansarovar, Jaipur',
    rating: 5,
    comment: 'Very professional local shifting in Jaipur. They arrived on time at 9 AM, dismantled our beds and sofa, and had everything settled in our new flat by evening.',
    serviceUsed: 'Packing and Moving',
  },
  {
    name: 'Sunil Choudhary',
    location: 'Jaipur to Pune',
    rating: 5,
    comment: 'Transported my Hyundai Creta from Jaipur to Pune. The car carrier service was reliable, odometer reading matched, and vehicle reached in pristine condition.',
    serviceUsed: 'Car Transportation',
  },
];

const defaultFaqs = [
  {
    question: 'How do you calculate shifting charges?',
    answer: 'Shifting charges depend on the volume of goods, packing material required, floor levels, elevator availability, and transit distance.',
  },
  {
    question: 'Are there hidden charges added later?',
    answer: 'No. History Packers & Movers provides transparent, upfront estimates detailing packing, labor, and transport with zero surprise charges.',
  },
  {
    question: 'How are delicate electronics and glassware protected?',
    answer: 'We use 5-layer packing for electronics: bubble wrap, thermocol corners, heavy corrugated boxes, and waterproof stretch wrapping.',
  },
  {
    question: 'Do you provide car and bike shifting along with household items?',
    answer: 'Yes, we provide combined shifting packages where your household goods and vehicles can be moved together seamlessly.',
  },
];

export default HomePage;

