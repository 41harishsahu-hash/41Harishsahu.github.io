import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Tag } from 'lucide-react';
import { getValidImageUrl, onImageErrorFallback } from '../utils/imageHelper';

export const GalleryLightbox = ({ images = [], currentIndex = 0, onClose, onNavigate }) => {
  const currentItem = images[currentIndex];

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    },
    [currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [handleKeyDown]);

  if (!currentItem) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(11, 19, 43, 0.94)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-in-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          padding: '0.5rem 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              backgroundColor: 'rgba(242, 140, 40, 0.25)',
              color: 'var(--brand-orange)',
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
            }}
          >
            {currentItem.category || 'Relocation Work'}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
            {currentIndex + 1} of {images.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          title="Close Lightbox (Esc)"
          aria-label="Close Lightbox"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Image Viewport with Nav Arrows */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          maxHeight: 'calc(100vh - 160px)',
          padding: '0.5rem',
        }}
      >
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            style={{
              position: 'absolute',
              left: '1rem',
              zIndex: 10,
              backgroundColor: 'rgba(23, 54, 93, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            title="Previous (Left Arrow)"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <img
          src={getValidImageUrl(currentItem.imageUrl, 'gallery')}
          alt={currentItem.title || 'Shifting Project'}
          onError={(e) => onImageErrorFallback(e, 'gallery')}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            userSelect: 'none',
          }}
          loading="eager"
        />

        {currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            style={{
              position: 'absolute',
              right: '1rem',
              zIndex: 10,
              backgroundColor: 'rgba(23, 54, 93, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            title="Next (Right Arrow)"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Caption & Metadata Footer */}
      <div
        style={{
          backgroundColor: 'rgba(23, 54, 93, 0.75)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          maxWidth: '850px',
          margin: '0 auto',
          width: '100%',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
            {currentItem.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: '#CBD5E1' }}>
            {currentItem.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} color="var(--brand-orange)" /> {currentItem.location}
              </span>
            )}
            {currentItem.projectDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} color="var(--brand-orange)" />
                {new Date(currentItem.projectDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {currentItem.description && (
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#E2E8F0', lineHeight: 1.5 }}>
            {currentItem.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default GalleryLightbox;

