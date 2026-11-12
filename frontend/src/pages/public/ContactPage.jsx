import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { enquiryAPI } from '../../services/api';
import { Alert } from '../../components/CommonUI';

// Word count calculation using actual words
const countWords = (str) => {
  if (!str || typeof str !== 'string' || !str.trim()) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    pickupAddress: 'Jaipur Central Hub, Rajasthan',
    destinationAddress: 'Jaipur Destination Network',
    pickupCity: 'Jaipur',
    destinationCity: 'Jaipur',
    serviceType: 'General Enquiry',
    movingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // LIVE INPUT RESTRICTIONS
  const handleNameChange = (e) => {
    // Alphabets and spaces only, max 50 characters
    const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    setFormData((prev) => ({ ...prev, name: filtered }));
    if (fieldErrors.name) {
      setFieldErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const handleMobileChange = (e) => {
    // Digits only, max 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    if (fieldErrors.mobile) {
      setFieldErrors((prev) => ({ ...prev, mobile: null }));
    }
  };

  const handleEmailChange = (e) => {
    // Max 50 characters
    const val = e.target.value.slice(0, 50);
    setFormData((prev) => ({ ...prev, email: val }));
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    const words = countWords(val);

    setFormData((prev) => ({ ...prev, message: val }));

    if (words > 500) {
      setFieldErrors((prev) => ({
        ...prev,
        message: `Message cannot exceed 500 words (${words} / 500 words). Please shorten your message.`,
      }));
    } else if (fieldErrors.message) {
      setFieldErrors((prev) => ({ ...prev, message: null }));
    }
  };

  const handleServiceChange = (e) => {
    setFormData((prev) => ({ ...prev, serviceType: e.target.value }));
  };

  // FORM VALIDATION
  const validateFrontend = () => {
    const errors = {};

    // 1. Full Name: 50 chars max, alphabets and spaces only
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      errors.name = 'Full Name is required.';
    } else if (nameTrimmed.length < 2) {
      errors.name = 'Full Name must be at least 2 characters.';
    } else if (nameTrimmed.length > 50) {
      errors.name = 'Full Name cannot exceed 50 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      errors.name = 'Full Name can only contain alphabets and spaces.';
    }

    // 2. Mobile: Exactly 10 digits, starts with 6, 7, 8, or 9
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    } else if (!/^[6-9]/.test(cleanMobile)) {
      errors.mobile = 'Indian mobile number must start with 6, 7, 8, or 9.';
    }

    // 3. Email: Max 50 chars, valid email syntax
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (emailTrimmed.length > 50) {
      errors.email = 'Email address cannot exceed 50 characters.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please provide a valid email address (e.g. name@example.com).';
    }

    // 4. Message / Enquiry Details: Required, min 5 chars, max 500 words
    const messageTrimmed = formData.message.trim();
    const msgWords = countWords(messageTrimmed);
    if (!messageTrimmed || messageTrimmed.length < 5) {
      errors.message = 'Please provide enquiry details (at least 5 characters).';
    } else if (msgWords > 500) {
      errors.message = `Message cannot exceed 500 words (currently ${msgWords} words).`;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setFieldErrors({});

    const errors = validateFrontend();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await enquiryAPI.create(formData);
      if (res.data?.success) {
        setSuccessMsg(
          `Message sent successfully! Reference enquiry #${res.data.data?.enquiryNumber}. Our relocation coordinator will call you shortly.`
        );
        setFormData({
          name: '',
          email: '',
          mobile: '',
          pickupAddress: 'Jaipur Central Hub, Rajasthan',
          destinationAddress: 'Jaipur Destination Network',
          pickupCity: 'Jaipur',
          destinationCity: 'Jaipur',
          serviceType: 'General Enquiry',
          movingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          message: '',
        });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setErrorMsg(err.response?.data?.message || 'Failed to submit your message. Please check the fields or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const messageWords = countWords(formData.message);

  return (
    <div className="contact-page">
      {/* Header Banner */}
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '3.5rem 0' }}>
        <div className="container">
          <span style={{ color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: '0.8125rem' }}>
            Get In Touch
          </span>
          <h1 style={{ color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Contact History Packers & Movers
          </h1>
          <p style={{ color: '#E2E8F0', maxWidth: '650px', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            Visit our central office in Dhawas, Jaipur, or reach out directly for immediate support and quotes.
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Left: Contact Info & Address */}
            <div>
              <span className="section-subtitle">Reach Our Team</span>
              <h2 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>Jaipur Headquarters & Operations Hub</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                  <MapPin size={22} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      Registered Business Address:
                    </strong>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                      SHOP NO 05 BASEMENT PLOT NO R 3/42, <br />
                      INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, <br />
                      JAIPUR, RAJASTHAN, INDIA.
                    </p>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                  <Phone size={22} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      Customer Support Lines:
                    </strong>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                      <a href="tel:+919251273070" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>+91 9251273070</a>
                      <br />
                      <a href="tel:+916375273070" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>+91 6375273070</a>
                    </p>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                  <Mail size={22} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      Official Email:
                    </strong>
                    <a href="mailto:Historypackersandmovers@gmail.com" style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
                      Historypackersandmovers@gmail.com
                    </a>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                  <Clock size={22} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      Working Hours:
                    </strong>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Monday – Sunday: 8:00 AM – 9:00 PM (Everyday Operational Support)
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>Chat via WhatsApp</strong>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Instant answers to moving queries</span>
                </div>
                <a
                  href="https://wa.me/919251273070?text=Hello%20History%20Packers%20and%20Movers,%20I%20have%20an%20enquiry%20regarding%20relocation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <MessageSquare size={16} /> Open WhatsApp
                </a>
              </div>
            </div>

            {/* Right: Working Enquiry Submission Form */}
            <div className="quote-form-card compact-form">
              <h3 style={{ marginBottom: '0.375rem', color: 'var(--brand-navy)', fontSize: '1.25rem' }}>Send Us a Message</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Fill out the form below and our Jaipur team will respond within 30 minutes.
              </p>

              {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
              {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label" htmlFor="contactName">Full Name *</label>
                    <span className="word-counter-badge">{formData.name.length} / 50 chars</span>
                  </div>
                  <input
                    type="text"
                    id="contactName"
                    name="name"
                    className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    maxLength={50}
                    placeholder="e.g. Ramesh Kumar"
                  />
                  {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
                </div>

                {/* Mobile & Email Row */}
                <div className="quote-grid-2col">
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="contactMobile">Mobile Number *</label>
                      <span className="word-counter-badge">{formData.mobile.length} / 10 digits</span>
                    </div>
                    <input
                      type="tel"
                      id="contactMobile"
                      name="mobile"
                      className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`}
                      value={formData.mobile}
                      onChange={handleMobileChange}
                      required
                      maxLength={10}
                      placeholder="10-digit mobile (e.g. 9251273070)"
                    />
                    {fieldErrors.mobile && <span className="form-error">{fieldErrors.mobile}</span>}
                  </div>

                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="contactEmail">Email Address *</label>
                      <span className="word-counter-badge">{formData.email.length} / 50 chars</span>
                    </div>
                    <input
                      type="email"
                      id="contactEmail"
                      name="email"
                      className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleEmailChange}
                      required
                      maxLength={50}
                      placeholder="name@example.com"
                    />
                    {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
                  </div>
                </div>

                {/* Service Interested In */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label" htmlFor="contactServiceType">Service Interested In</label>
                  </div>
                  <select
                    id="contactServiceType"
                    name="serviceType"
                    className="form-control"
                    value={formData.serviceType}
                    onChange={handleServiceChange}
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Home Relocation">Home Relocation</option>
                    <option value="Car Transportation">Car Transportation</option>
                    <option value="Two-Wheeler Transportation">Two-Wheeler Transportation</option>
                    <option value="Office Relocation">Office Relocation</option>
                    <option value="Shop Relocation">Shop Relocation</option>
                    <option value="Packing and Moving">Packing and Moving</option>
                    <option value="Loading and Unloading">Loading and Unloading</option>
                    <option value="Door-to-Door Transportation">Door-to-Door Transportation</option>
                  </select>
                </div>

                {/* Message / Enquiry Details */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label" htmlFor="contactMessage">Message / Enquiry Details *</label>
                    <span
                      className={`word-counter-badge ${
                        messageWords > 500
                          ? 'limit-reached'
                          : messageWords >= 450
                          ? 'limit-warn'
                          : ''
                      }`}
                    >
                      {messageWords} / 500 words
                      {messageWords >= 500 && ' (Limit reached)'}
                    </span>
                  </div>
                  <textarea
                    id="contactMessage"
                    name="message"
                    rows={3}
                    className={`form-control ${fieldErrors.message ? 'is-invalid' : ''}`}
                    value={formData.message}
                    onChange={handleMessageChange}
                    required
                    placeholder="Tell us about your moving requirements, origin and destination, volume of items..."
                  />
                  {fieldErrors.message && <span className="form-error">{fieldErrors.message}</span>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginTop: '0.75rem',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Message'} <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
