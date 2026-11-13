import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink,
  Phone,
  Image as ImageIcon,
} from 'lucide-react';
import { contentAPI } from '../../services/api';
import { GalleryLightbox } from '../../components/GalleryLightbox';
import { LoadingSpinner } from '../../components/CommonUI';

const CATEGORIES = [
  'All',
  'Household Shifting',
  'Office Relocation',
  'Packing & Protection',
  'Vehicle Transportation',
  'Commercial Shifting',
];

export const GalleryPage = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await contentAPI.getGallery();
      if (res.data?.success) {
        setGallery(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGallery = activeCategory === 'All'
    ? gallery
    : gallery.filter((item) => item.category === activeCategory);

  return (
    <div className="gallery-page">
      {/* 1. HERO HEADER */}
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '4rem 0 3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(242, 140, 40, 0.2)', padding: '0.375rem 0.875rem', borderRadius: '999px', color: 'var(--brand-orange)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Camera size={16} /> Real Relocation Projects
          </div>
          <h1 style={{ color: '#FFFFFF', marginBottom: '1rem', fontSize: '2.5rem' }}>
            Our Previous Shifting Work
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Browse genuine photographs from residential shifting, office moving, multi-layer protective packaging, and vehicle transportation executed by History Packers & Movers.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <ShieldCheck size={16} color="var(--brand-orange)" />
            <span>Privacy Assured: All client identities, documents, and vehicle registration numbers are respectfully safeguarded.</span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTERS & GALLERY GRID */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '500px' }}>
        <div className="container">
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '999px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  backgroundColor: activeCategory === cat ? 'var(--brand-orange)' : '#FFFFFF',
                  color: activeCategory === cat ? '#FFFFFF' : 'var(--text-primary)',
                  borderColor: activeCategory === cat ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <LoadingSpinner text="Loading verified project gallery..." />
          ) : filteredGallery.length === 0 ? (
            /* Clean Empty State */
            <div
              className="card"
              style={{
                maxWidth: '650px',
                margin: '3rem auto',
                textAlign: 'center',
                padding: '3.5rem 2rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(23, 54, 93, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  color: 'var(--brand-navy)',
                }}
              >
                <ImageIcon size={36} />
              </div>

              <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                {activeCategory === 'All' ? 'Gallery Being Cataloged' : `No Projects in "${activeCategory}" Yet`}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                We are actively photographing and uploading verified project images from our daily moves across Jaipur and intercity highways.
                Need to see work samples for your specific route or moving volume? Get in touch with our operations team directly!
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/quote" className="btn btn-primary">
                  Request Free Moving Quote <ArrowRight size={16} />
                </Link>
                <a href="tel:+919251273070" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> Call Jaipur Office
                </a>
              </div>
            </div>
          ) : (
            /* Gallery Image Grid */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '1.75rem',
              }}
            >
              {filteredGallery.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="card gallery-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#FFFFFF',
                  }}
                  onClick={() => setLightboxIndex(idx)}
                >
                  {/* Image Container with Consistent Aspect Ratio */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '66.66%', // 3:2 Aspect Ratio
                      backgroundColor: '#F1F5F9',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
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

                    {/* Category Overlay Tag */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.875rem',
                        left: '0.875rem',
                        backgroundColor: 'rgba(23, 54, 93, 0.88)',
                        color: '#FFFFFF',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.category || 'Relocation'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
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

                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {item.title}
                    </h3>

                    {item.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                        {item.description}
                      </p>
                    )}

                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        View Full Photo <ExternalLink size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. LIGHTBOX PREVIEW */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={filteredGallery}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {/* 4. BOTTOM ACTION BANNER */}
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '3.5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: '#FFFFFF', marginBottom: '0.875rem' }}>Need Safe Shifting for Your Home or Business?</h2>
          <p style={{ color: '#E2E8F0', fontSize: '1.0625rem', marginBottom: '2rem' }}>
            Trust our trained crew and covered logistics fleet for punctual, damage-free moving across Rajasthan and pan-India.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/quote" className="btn btn-primary btn-lg">
              Get an Instant Free Quote <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}>
              Contact Jaipur Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;

