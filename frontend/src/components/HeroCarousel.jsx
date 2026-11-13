import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { getValidImageUrl } from '../utils/imageHelper';

/**
 * Dynamic Hero Background Image Carousel
 * Implements smooth 5s auto-fade, hover pause, reduced motion detection,
 * accessible controls, and resilient fallback handling.
 */
export const HeroCarousel = ({ slides = [], interval = 5000, fallbackBg = 'var(--bg-secondary)' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener?.('change', listener);
      return () => mediaQuery.removeEventListener?.('change', listener);
    }
  }, []);

  // Filter out slides that failed loading
  const validSlides = slides.filter((slide, idx) => !failedImages[slide.imageUrl || idx]);

  const totalSlides = validSlides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides > 1) {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides > 1) {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  }, [totalSlides]);

  const goToSlide = (index) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
    }
  };

  // Auto-slideshow timer
  useEffect(() => {
    if (totalSlides <= 1 || isPaused || reducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused, reducedMotion, interval, nextSlide]);

  // Handle image load error
  const handleImageError = (identifier) => {
    setFailedImages((prev) => ({ ...prev, [identifier]: true }));
    if (currentIndex >= totalSlides - 1 && totalSlides > 1) {
      setCurrentIndex(0);
    }
  };

  // If no slides available, render clean fallback background
  if (totalSlides === 0) {
    return (
      <div
        className="hero-carousel-fallback"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: fallbackBg,
          zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(23, 54, 93, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />
    );
  }

  const currentSlide = validSlides[currentIndex] || validSlides[0];

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        userSelect: 'none',
      }}
      aria-roledescription="carousel"
      aria-label="History Packers & Movers Background Showcase"
    >
      {/* Background Slides */}
      {validSlides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide._id || slide.imageUrl || idx}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: reducedMotion ? 'none' : 'opacity 1000ms ease-in-out',
              zIndex: isActive ? 1 : 0,
              willChange: 'opacity',
            }}
            aria-hidden={!isActive}
          >
            <img
              src={getValidImageUrl(slide.imageUrl, 'hero')}
              alt={slide.title || 'Relocation Work Background'}
              className="hero-carousel-img"
              onError={() => handleImageError(slide.imageUrl || idx)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                display: 'block',
              }}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Subtle Readability Overlay: light directional gradient (10-20%) keeps text readable while maintaining 90-100% image clarity */}
      <div
        className="hero-carousel-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'linear-gradient(to right, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 45%, rgba(255, 255, 255, 0.02) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Controls Bar (Only shown if multiple slides exist) */}
      {totalSlides > 1 && (
        <div
          className="hero-carousel-controls"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(23, 54, 93, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '0.375rem 0.75rem',
            borderRadius: '999px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Previous Arrow */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous carousel image"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              borderRadius: '50%',
              transition: 'background 0.2s',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Slide Indicator Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {validSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                style={{
                  width: idx === currentIndex ? '22px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: idx === currentIndex ? 'var(--brand-orange)' : 'rgba(255, 255, 255, 0.45)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next carousel image"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              borderRadius: '50%',
              transition: 'background 0.2s',
            }}
          >
            <ChevronRight size={16} />
          </button>

          {/* Play/Pause Toggle Indicator */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume automatic slideshow' : 'Pause automatic slideshow'}
            title={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-orange)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem',
              marginLeft: '0.25rem',
            }}
          >
            {isPaused ? <Play size={13} fill="var(--brand-orange)" /> : <Pause size={13} fill="var(--brand-orange)" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;

