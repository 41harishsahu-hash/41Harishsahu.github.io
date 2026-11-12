import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Truck, Calendar, MapPin, Phone, HelpCircle } from 'lucide-react';
import { enquiryAPI } from '../../services/api';
import { Alert } from '../../components/CommonUI';

// Word count calculation using actual words
const countWords = (str) => {
  if (!str || typeof str !== 'string' || !str.trim()) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

export const QuotePage = () => {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || 'Home Relocation';

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    pickupAddress: '',
    destinationAddress: '',
    pickupCity: 'Jaipur',
    destinationCity: '',
    serviceType: preselectedService,
    movingDate: '',
    propertyType: '2 BHK',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, serviceType: preselectedService }));
    }
  }, [preselectedService]);

  // LIVE INPUT RESTRICTIONS & CHANGE HANDLERS
  const handleNameChange = (e) => {
    // Alphabets and spaces only, maximum 50 characters
    const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    setFormData((prev) => ({ ...prev, name: filtered }));
    if (fieldErrors.name) {
      setFieldErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const handleMobileChange = (e) => {
    // Digits only, maximum 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    if (fieldErrors.mobile) {
      setFieldErrors((prev) => ({ ...prev, mobile: null }));
    }
  };

  const handleEmailChange = (e) => {
    // Maximum 50 characters
    const val = e.target.value.slice(0, 50);
    setFormData((prev) => ({ ...prev, email: val }));
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handleCityChange = (field, e) => {
    // Allow alphabets, spaces, and reasonable punctuation (., -)
    const cleaned = e.target.value.replace(/[^a-zA-Z\s.,'-]/g, '');
    const words = countWords(cleaned);

    setFormData((prev) => ({ ...prev, [field]: cleaned }));

    if (words > 25) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: `City cannot exceed 25 words (${words} / 25 words). Please shorten your input.`,
      }));
    } else if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAddressChange = (field, e) => {
    const val = e.target.value;
    const words = countWords(val);

    setFormData((prev) => ({ ...prev, [field]: val }));

    if (words > 250) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: `Address cannot exceed 250 words (${words} / 250 words). Please shorten your address.`,
      }));
    } else if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    const words = countWords(val);

    setFormData((prev) => ({ ...prev, message: val }));

    if (words > 500) {
      setFieldErrors((prev) => ({
        ...prev,
        message: `Message cannot exceed 500 words (${words} / 500 words). Please shorten your text.`,
      }));
    } else if (fieldErrors.message) {
      setFieldErrors((prev) => ({ ...prev, message: null }));
    }
  };

  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
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

    // 2. Mobile Number: Exactly 10 digits, starts with 6, 7, 8, or 9
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    } else if (!/^[6-9]/.test(cleanMobile)) {
      errors.mobile = 'Indian mobile number must start with 6, 7, 8, or 9.';
    }

    // 3. Email: Valid format, max 50 characters
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (emailTrimmed.length > 50) {
      errors.email = 'Email address cannot exceed 50 characters.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please provide a valid email address (e.g. name@example.com).';
    }

    // 4. Pickup City: Max 25 words, alphabets and spaces
    const pickupCityWords = countWords(formData.pickupCity);
    if (!formData.pickupCity.trim()) {
      errors.pickupCity = 'Pickup city is required.';
    } else if (pickupCityWords > 25) {
      errors.pickupCity = `Pickup city cannot exceed 25 words (currently ${pickupCityWords} words).`;
    } else if (!/^[a-zA-Z\s.,'-]+$/.test(formData.pickupCity.trim())) {
      errors.pickupCity = 'Pickup city must contain only alphabets and spaces.';
    }

    // 5. Destination City: Max 25 words, alphabets and spaces
    const destCityWords = countWords(formData.destinationCity);
    if (!formData.destinationCity.trim()) {
      errors.destinationCity = 'Destination city is required.';
    } else if (destCityWords > 25) {
      errors.destinationCity = `Destination city cannot exceed 25 words (currently ${destCityWords} words).`;
    } else if (!/^[a-zA-Z\s.,'-]+$/.test(formData.destinationCity.trim())) {
      errors.destinationCity = 'Destination city must contain only alphabets and spaces.';
    }

    // 6. Pickup Address: Min 5 chars, Max 250 words
    const pickupAddrWords = countWords(formData.pickupAddress);
    if (!formData.pickupAddress.trim() || formData.pickupAddress.trim().length < 5) {
      errors.pickupAddress = 'Pickup address must be at least 5 characters.';
    } else if (pickupAddrWords > 250) {
      errors.pickupAddress = `Pickup address cannot exceed 250 words (currently ${pickupAddrWords} words).`;
    }

    // 7. Destination Address: Min 5 chars, Max 250 words
    const destAddrWords = countWords(formData.destinationAddress);
    if (!formData.destinationAddress.trim() || formData.destinationAddress.trim().length < 5) {
      errors.destinationAddress = 'Destination address must be at least 5 characters.';
    } else if (destAddrWords > 250) {
      errors.destinationAddress = `Destination address cannot exceed 250 words (currently ${destAddrWords} words).`;
    }

    // 8. Moving Date
    if (!formData.movingDate) {
      errors.movingDate = 'Please select your preferred moving date.';
    }

    // 9. Message / Inventory: Max 500 words
    const messageWords = countWords(formData.message);
    if (messageWords > 500) {
      errors.message = `Message cannot exceed 500 words (currently ${messageWords} words).`;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setSuccessData(res.data.data);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setErrorMsg(err.response?.data?.message || 'Failed to submit quote request. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Word count stats
  const pickupAddressWords = countWords(formData.pickupAddress);
  const destAddressWords = countWords(formData.destinationAddress);
  const messageWords = countWords(formData.message);

  return (
    <div className="quote-page">
      {/* Header Banner (Compact & Aligned) */}
      <section className="quote-banner">
        <div className="container quote-page-container">
          <span className="quote-banner-tag">
            Transparent Pricing
          </span>
          <h1 className="quote-banner-title">
            Get a Free Relocation Quotation
          </h1>
          <p className="quote-banner-desc">
            Fill in your shifting details below to receive a customized estimate from History Packers & Movers.
          </p>
        </div>
      </section>

      {/* Main Content Area (Compact, 680px Centered) */}
      <section className="quote-body-section">
        <div className="container quote-page-container">
          {successData ? (
            <div className="quote-form-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF', border: '2px solid #BBF7D0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <CheckCircle size={32} />
              </div>
              <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quotation Request Received!</h2>
              <p style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
                Thank you, <strong>{formData.name}</strong>. Your enquiry has been registered in our system.
              </p>

              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#F8FAFC',
                  padding: '0.75rem 1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enquiry Reference Number
                </span>
                <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {successData.enquiryNumber}
                </span>
              </div>

              <div style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p>• Our Jaipur moving supervisor will review your items and call you at <strong>{formData.mobile}</strong>.</p>
                <p>• You can also track the status of this enquiry anytime by logging in with your email.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/" className="btn btn-navy btn-sm">Return Home</Link>
                <a href="tel:+919251273070" className="btn btn-primary btn-sm">
                  <Phone size={15} /> Call Shifting Team
                </a>
              </div>
            </div>
          ) : (
            <div className="quote-form-card compact-form">
              {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

              <form onSubmit={handleSubmit} noValidate>
                {/* 1. Contact Information */}
                <div className="quote-section-title">
                  1. Contact Information
                </div>

                <div className="quote-grid-2col">
                  {/* Full Name */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="name">Full Name *</label>
                      <span className="word-counter-badge">{formData.name.length} / 50 chars</span>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                      maxLength={50}
                      placeholder="e.g. Rahul Sharma"
                    />
                    {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="mobile">Mobile Number (India) *</label>
                      <span className="word-counter-badge">{formData.mobile.length} / 10 digits</span>
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className={`form-control ${fieldErrors.mobile ? 'is-invalid' : ''}`}
                      value={formData.mobile}
                      onChange={handleMobileChange}
                      required
                      maxLength={10}
                      placeholder="10-digit number (e.g. 9251273070)"
                    />
                    {fieldErrors.mobile && <span className="form-error">{fieldErrors.mobile}</span>}
                  </div>
                </div>

                <div className="quote-grid-2col">
                  {/* Email Address */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="email">Email Address *</label>
                      <span className="word-counter-badge">{formData.email.length} / 50 chars</span>
                    </div>
                    <input
                      type="email"
                      id="email"
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

                  {/* Moving Date */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="movingDate">Preferred Moving Date *</label>
                    </div>
                    <input
                      type="date"
                      id="movingDate"
                      name="movingDate"
                      min={new Date().toISOString().split('T')[0]}
                      className={`form-control ${fieldErrors.movingDate ? 'is-invalid' : ''}`}
                      value={formData.movingDate}
                      onChange={handleGenericChange}
                      required
                    />
                    {fieldErrors.movingDate && <span className="form-error">{fieldErrors.movingDate}</span>}
                  </div>
                </div>

                {/* 2. Relocation & Route Details */}
                <div className="quote-section-title">
                  2. Relocation & Route Details
                </div>

                <div className="quote-grid-2col">
                  {/* Pickup City */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="pickupCity">Pickup City *</label>
                      <span className={`word-counter-badge ${countWords(formData.pickupCity) > 25 ? 'limit-reached' : ''}`}>
                        {countWords(formData.pickupCity)} / 25 words
                      </span>
                    </div>
                    <input
                      type="text"
                      id="pickupCity"
                      name="pickupCity"
                      className={`form-control ${fieldErrors.pickupCity ? 'is-invalid' : ''}`}
                      value={formData.pickupCity}
                      onChange={(e) => handleCityChange('pickupCity', e)}
                      required
                      placeholder="e.g. Jaipur"
                    />
                    {fieldErrors.pickupCity && <span className="form-error">{fieldErrors.pickupCity}</span>}
                  </div>

                  {/* Destination City */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="destinationCity">Destination City *</label>
                      <span className={`word-counter-badge ${countWords(formData.destinationCity) > 25 ? 'limit-reached' : ''}`}>
                        {countWords(formData.destinationCity)} / 25 words
                      </span>
                    </div>
                    <input
                      type="text"
                      id="destinationCity"
                      name="destinationCity"
                      className={`form-control ${fieldErrors.destinationCity ? 'is-invalid' : ''}`}
                      value={formData.destinationCity}
                      onChange={(e) => handleCityChange('destinationCity', e)}
                      required
                      placeholder="e.g. Delhi, Mumbai, Udaipur"
                    />
                    {fieldErrors.destinationCity && <span className="form-error">{fieldErrors.destinationCity}</span>}
                  </div>
                </div>

                <div className="quote-grid-2col">
                  {/* Pickup Full Address */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="pickupAddress">Pickup Full Address *</label>
                      <span
                        className={`word-counter-badge ${
                          pickupAddressWords > 250
                            ? 'limit-reached'
                            : pickupAddressWords >= 225
                            ? 'limit-warn'
                            : ''
                        }`}
                      >
                        {pickupAddressWords} / 250 words
                        {pickupAddressWords >= 250 && ' (Limit reached)'}
                      </span>
                    </div>
                    <input
                      type="text"
                      id="pickupAddress"
                      name="pickupAddress"
                      className={`form-control ${fieldErrors.pickupAddress ? 'is-invalid' : ''}`}
                      value={formData.pickupAddress}
                      onChange={(e) => handleAddressChange('pickupAddress', e)}
                      required
                      placeholder="Flat/House, Society, Sector, Street"
                    />
                    {fieldErrors.pickupAddress && <span className="form-error">{fieldErrors.pickupAddress}</span>}
                  </div>

                  {/* Destination Full Address */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="destinationAddress">Destination Full Address *</label>
                      <span
                        className={`word-counter-badge ${
                          destAddressWords > 250
                            ? 'limit-reached'
                            : destAddressWords >= 225
                            ? 'limit-warn'
                            : ''
                        }`}
                      >
                        {destAddressWords} / 250 words
                        {destAddressWords >= 250 && ' (Limit reached)'}
                      </span>
                    </div>
                    <input
                      type="text"
                      id="destinationAddress"
                      name="destinationAddress"
                      className={`form-control ${fieldErrors.destinationAddress ? 'is-invalid' : ''}`}
                      value={formData.destinationAddress}
                      onChange={(e) => handleAddressChange('destinationAddress', e)}
                      required
                      placeholder="Flat/House, Society, Sector, Street"
                    />
                    {fieldErrors.destinationAddress && <span className="form-error">{fieldErrors.destinationAddress}</span>}
                  </div>
                </div>

                {/* 3. Service Scope & Inventory */}
                <div className="quote-section-title">
                  3. Service Scope & Inventory
                </div>

                <div className="quote-grid-2col">
                  {/* Service Type */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="serviceType">Service Type *</label>
                    </div>
                    <select
                      id="serviceType"
                      name="serviceType"
                      className="form-control"
                      value={formData.serviceType}
                      onChange={handleGenericChange}
                    >
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

                  {/* Property Type */}
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="propertyType">Property / Move Size</label>
                    </div>
                    <select
                      id="propertyType"
                      name="propertyType"
                      className="form-control"
                      value={formData.propertyType}
                      onChange={handleGenericChange}
                    >
                      <option value="1 RK / Single Room">1 RK / Single Room</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK / Villa">4+ BHK / Villa</option>
                      <option value="Vehicle Only (Car/Bike)">Vehicle Only (Car/Bike)</option>
                      <option value="Office / Commercial Space">Office / Commercial Space</option>
                      <option value="Few Household Items / Luggage">Few Household Items / Luggage</option>
                    </select>
                  </div>
                </div>

                {/* Message / Specific Moving Items */}
                <div className="quote-grid-1col">
                  <div className="form-group">
                    <div className="form-label-row">
                      <label className="form-label" htmlFor="message">Message / Specific Moving Items</label>
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
                      id="message"
                      name="message"
                      rows={2}
                      className={`form-control ${fieldErrors.message ? 'is-invalid' : ''}`}
                      value={formData.message}
                      onChange={handleMessageChange}
                      placeholder="List major furniture, electronics, heavy items, floor number, elevator availability, etc."
                    />
                    {fieldErrors.message && <span className="form-error">{fieldErrors.message}</span>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-submit-quote"
                >
                  {loading ? 'Submitting Quotation Request...' : 'Submit Quotation Request'} <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuotePage;
