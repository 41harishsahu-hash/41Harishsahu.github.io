import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { Alert } from '../../components/CommonUI';
import Logo from '../../components/Logo';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;
        if (status === 401) {
          setErrorMsg(serverMessage || 'Invalid administrator credentials. Please check your email and master password.');
        } else if (status === 403) {
          setErrorMsg(serverMessage || 'Administrator account is deactivated. Please contact support.');
        } else if (status >= 500) {
          setErrorMsg(serverMessage || `Authentication server error (${status}). Please try again in a few moments.`);
        } else {
          setErrorMsg(serverMessage || 'Authentication failed. Please verify your credentials.');
        }
      } else if (err.request) {
        setErrorMsg('Unable to reach the backend server. Please check your connection or wait while the server wakes up.');
      } else {
        setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B132B', padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo height={48} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'rgba(23, 54, 93, 0.08)', color: 'var(--brand-navy)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ShieldCheck size={14} color="var(--brand-navy)" /> Restricted Access
          </div>
          <h2 style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: 'var(--brand-navy)' }}>
            Admin Portal Login
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Authorized staff and management authentication
          </p>
        </div>

        {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="adminEmail">Admin Email</label>
            <input
              type="email"
              id="adminEmail"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter authorized administrator Gmail"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="adminPassword">Master Password</label>
            <PasswordInput
              id="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-navy"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

