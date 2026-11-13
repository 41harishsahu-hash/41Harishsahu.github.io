/**
 * Image URL normalization and resilient fallback utility.
 * Guarantees that valid Cloudinary HTTPS URLs, local static assets, and SVG fallbacks
 * render without broken browser image icons or layout shift across desktop and mobile.
 */

export const PLACEHOLDER_GALLERY = '/images/placeholder-gallery.svg';
export const PLACEHOLDER_HERO = '/images/placeholder-hero.svg';

/**
 * Normalizes an image URL from database records or API payloads.
 * @param {string} url - Stored image URL
 * @param {'gallery' | 'hero'} type - Category of image asset
 * @returns {string} Sanitized URL or clean SVG fallback
 */
export const getValidImageUrl = (url, type = 'gallery') => {
  const fallback = type === 'hero' ? PLACEHOLDER_HERO : PLACEHOLDER_GALLERY;

  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Already absolute HTTPS/HTTP or data URI
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Relative static asset path (e.g. /images/gallery/...)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
};

/**
 * Image error event handler that gracefully replaces broken images with clean SVG placeholders.
 * Prevents recursive error loops.
 */
export const onImageErrorFallback = (e, type = 'gallery') => {
  const fallback = type === 'hero' ? PLACEHOLDER_HERO : PLACEHOLDER_GALLERY;
  if (e?.target && e.target.src && !e.target.src.endsWith(fallback)) {
    e.target.onerror = null; // Prevent infinite loop if fallback fails
    e.target.src = fallback;
  }
};

