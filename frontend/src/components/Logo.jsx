import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Logo Component for History Packers & Movers
 * Uses the official brand logo uploaded by the user with clean responsive scaling
 */
export const Logo = ({ height = 50, showText = false, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to="/" className={`logo-link ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
      {!imgError ? (
        <img
          src="/images/logo.png"
          alt="History Packers & Movers Logo"
          style={{
            height: `${height}px`,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            height: `${height}px`,
            padding: '0 0.75rem',
            backgroundColor: 'var(--brand-navy)',
            color: '#FFFFFF',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '0.05em',
          }}
        >
          HISTORY PACKERS
        </div>
      )}

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--brand-navy)', lineHeight: 1.1 }}>
            HISTORY
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-orange)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Packers & Movers
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;

