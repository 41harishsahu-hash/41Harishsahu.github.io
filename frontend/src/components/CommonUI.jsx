import React from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// BADGE COMPONENT
export const Badge = ({ status, type }) => {
  let badgeClass = 'badge-neutral';
  const s = (status || '').toLowerCase();

  if (['new', 'pending'].includes(s)) badgeClass = 'badge-info';
  else if (['contacted', 'quotation sent', 'packing', 'in transit', 'out for delivery', 'partial'].includes(s)) badgeClass = 'badge-warning';
  else if (['confirmed', 'delivered', 'converted', 'paid', 'active'].includes(s)) badgeClass = 'badge-success';
  else if (['cancelled', 'rejected', 'inactive'].includes(s)) badgeClass = 'badge-danger';

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};

// STAT CARD COMPONENT
export const StatCard = ({ title, value, icon: Icon, color = 'navy', subtitle }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: color === 'orange' ? 'rgba(242, 140, 40, 0.1)' : 'rgba(23, 54, 93, 0.08)',
              color: color === 'orange' ? 'var(--brand-orange)' : 'var(--brand-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', lineHeight: 1.1 }}>
        {value}
      </div>
      {subtitle && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
    </div>
  );
};

// MODAL COMPONENT
export const Modal = ({ isOpen = true, onClose, title, children, footer }) => {
  if (isOpen === false) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ALERT COMPONENT
export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.125rem' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// LOADING SPINNER COMPONENT
export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.75rem' }}>
      <Loader2 size={32} className="spin" style={{ color: 'var(--brand-orange)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{text}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// PAGINATION COMPONENT
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} /> Previous
      </button>

      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};

