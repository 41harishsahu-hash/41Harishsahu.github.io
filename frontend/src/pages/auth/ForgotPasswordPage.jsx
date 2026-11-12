import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Alert } from '../../components/CommonUI';
import Logo from '../../components/Logo';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [devToken, setDevToken] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await authAPI.forgotPassword({ email });
      setSuccessMsg(res.data?.message || 'Password reset instructions have been dispatched.');
      if (res.data?.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo height={48} />
          <h2 style={{ fontSize: '1.375rem', marginTop: '1rem', color: 'var(--brand-navy)' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.875rem' }}>Enter your email to receive recovery instructions</p>
        </div>

        {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        {devToken ? (
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              Development Mode Token Detected:
            </span>
            <code style={{ display: 'block', wordBreak: 'break-all', fontSize: '0.8125rem', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              {devToken}
            </code>
            <Link to={`/reset-password?token=${devToken}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Proceed to Set New Password <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Registered Email Address</label>
              <input
                type="email"
                id="email"
                required
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--brand-navy)', fontWeight: 600 }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

