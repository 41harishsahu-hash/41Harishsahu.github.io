import React, { useState, useEffect } from 'react';
import { Settings, Phone, Mail, MapPin, Lock, Save, Cloud, CheckCircle, AlertTriangle } from 'lucide-react';
import { contentAPI, adminAPI, authAPI } from '../../services/api';
import PasswordInput from '../../components/PasswordInput';
import { Alert, LoadingSpinner } from '../../components/CommonUI';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Settings
  const [settings, setSettings] = useState({
    companyName: 'History Packers & Movers',
    phone1: '+91 9251273070',
    phone2: '+91 6375273070',
    email: 'Historypackersandmovers@gmail.com',
    address: 'SHOP NO 05 BASEMENT PLOT NO R 3/42, INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, JAIPUR, RAJASTHAN, INDIA.',
    city: 'Jaipur',
    state: 'Rajasthan',
    whatsappNumber: '+91 9251273070',
    seoTitle: '',
    seoDescription: '',
  });

  // Cloudinary Status
  const [cloudinaryStatus, setCloudinaryStatus] = useState(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  useEffect(() => {
    Promise.all([contentAPI.getSettings(), adminAPI.getUploadStatus()])
      .then(([setRes, cloudRes]) => {
        if (setRes.data?.success && setRes.data.data) {
          setSettings(setRes.data.data);
        }
        if (cloudRes.data) {
          setCloudinaryStatus(cloudRes.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await adminAPI.updateSettings(settings);
      if (res.data?.success) {
        setMsg({ type: 'success', text: 'Business settings and contact info saved successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to update business settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword.length < 8) {
      setPassMsg({ type: 'danger', text: 'Password must be at least 8 characters long' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'danger', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await authAPI.changePassword({ currentPassword, newPassword });
      setPassMsg({ type: 'success', text: res.data?.message || 'Admin password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to change admin password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading system settings..." />;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>System Configuration & Credentials</h2>
          <p>Business contact information, Cloudinary status, and security keys</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Contact & Business Info */}
        <div className="card">
          <h3 style={{ fontSize: '1.1875rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Official Business Contact Info
          </h3>

          {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                className="form-control"
                value={settings.companyName || ''}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Primary Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.phone1 || ''}
                  onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Secondary Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.phone2 || ''}
                  onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.whatsappNumber || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Physical Office Address</label>
              <textarea
                rows={3}
                className="form-control"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Business Details'}
            </button>
          </form>
        </div>

        {/* Cloudinary Integration & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Cloudinary Status Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cloud size={20} color="var(--brand-orange)" />
              Cloudinary Image Storage Status
            </h3>

            {cloudinaryStatus?.isCloudinaryConfigured ? (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700 }}>
                  <CheckCircle size={18} /> Cloudinary is Connected & Operational
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: '#15803D' }}>
                  Cloud Name: <code>{cloudinaryStatus.cloudName}</code>. Direct image uploads, transformations, and asset management are active.
                </p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontWeight: 700 }}>
                  <AlertTriangle size={18} /> Credentials Pending
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: '#92400E', lineHeight: 1.5 }}>
                  To activate live Cloudinary signed image uploads, supply your Cloudinary credentials in <code>backend/.env</code>:
                  <br />
                  <code>CLOUDINARY_CLOUD_NAME=...</code><br />
                  <code>CLOUDINARY_API_KEY=...</code><br />
                  <code>CLOUDINARY_API_SECRET=...</code>
                </p>
              </div>
            )}
          </div>

          {/* Admin Password Change Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1875rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} color="var(--brand-orange)" />
              Admin Password Security
            </h3>

            {passMsg && <Alert type={passMsg.type} message={passMsg.text} onClose={() => setPassMsg(null)} />}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="adminCurrentPass">Current Admin Password *</label>
                <PasswordInput
                  id="adminCurrentPass"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adminNewPass">New Admin Password *</label>
                <PasswordInput
                  id="adminNewPass"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters (letters & numbers)"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adminConfirmPass">Confirm New Admin Password *</label>
                <PasswordInput
                  id="adminConfirmPass"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <button type="submit" disabled={passwordLoading} className="btn btn-navy" style={{ width: '100%', marginTop: '0.5rem' }}>
                {passwordLoading ? 'Updating...' : 'Update Admin Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

