import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, HelpCircle, MessageSquare, PlusCircle, Edit, Trash2, Save, Star, Camera, Sliders } from 'lucide-react';
import { adminAPI, contentAPI } from '../../services/api';
import { Modal, LoadingSpinner, Alert, Badge } from '../../components/CommonUI';

export const AdminContent = () => {
  const [tab, setTab] = useState('content'); // 'content' | 'faqs' | 'testimonials'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Website Content State
  const [settings, setSettings] = useState({
    companyName: 'History Packers & Movers',
    tagline: 'Safe Fast Reliable',
    heroHeadline: 'Moving Made Simple. Moving Made Safe.',
    heroSubtext: 'Reliable packing and moving solutions for your home, office and vehicle. Experience safe handling, professional packing and dependable transportation.',
    aboutStory: '',
    seoTitle: '',
    seoDescription: '',
  });

  // FAQs State
  const [faqs, setFaqs] = useState([]);
  const [faqModal, setFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', displayOrder: 0 });

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialModal, setTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testForm, setTestForm] = useState({ name: '', location: '', rating: 5, comment: '', serviceUsed: 'Home Relocation', isApproved: true });

  const loadData = async () => {
    setLoading(true);
    try {
      const [setRes, faqRes, testRes] = await Promise.all([
        contentAPI.getSettings(),
        adminAPI.getAdminFAQs(),
        adminAPI.getAdminTestimonials(),
      ]);

      if (setRes.data?.success && setRes.data.data) setSettings(setRes.data.data);
      if (faqRes.data?.success) setFaqs(faqRes.data.data || []);
      if (testRes.data?.success) setTestimonials(testRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await adminAPI.updateSettings(settings);
      if (res.data?.success) {
        setMsg({ type: 'success', text: 'Website content updated successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to update website content.' });
    } finally {
      setSaving(false);
    }
  };

  // FAQ Handlers
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await adminAPI.updateFAQ(editingFaq._id, faqForm);
      } else {
        await adminAPI.createFAQ(faqForm);
      }
      setFaqModal(false);
      loadData();
    } catch (err) {
      alert('Failed to save FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await adminAPI.deleteFAQ(id);
      loadData();
    } catch (err) {
      alert('Failed to delete FAQ');
    }
  };

  // Testimonial Handlers
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await adminAPI.updateTestimonial(editingTestimonial._id, testForm);
      } else {
        await adminAPI.createTestimonial(testForm);
      }
      setTestimonialModal(false);
      loadData();
    } catch (err) {
      alert('Failed to save testimonial');
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminAPI.deleteTestimonial(id);
      loadData();
    } catch (err) {
      alert('Failed to delete testimonial');
    }
  };

  if (loading) return <LoadingSpinner text="Loading website content..." />;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Website Content & Media Management</h2>
          <p>Control homepage text, customer reviews, and frequently asked questions</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'content' ? 'btn-navy' : 'btn-outline'}`}
          onClick={() => setTab('content')}
        >
          <Globe size={16} /> Homepage Content
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'faqs' ? 'btn-navy' : 'btn-outline'}`}
          onClick={() => setTab('faqs')}
        >
          <HelpCircle size={16} /> FAQs ({faqs.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === 'testimonials' ? 'btn-navy' : 'btn-outline'}`}
          onClick={() => setTab('testimonials')}
        >
          <MessageSquare size={16} /> Testimonials ({testimonials.length})
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/carousel"
            className="btn btn-sm btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)', fontWeight: 600 }}
          >
            <Sliders size={15} /> Hero Carousel &rarr;
          </Link>
          <Link
            to="/admin/gallery"
            className="btn btn-sm btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', borderColor: 'var(--brand-orange)', color: 'var(--brand-orange)', fontWeight: 600 }}
          >
            <Camera size={15} /> Work Gallery &rarr;
          </Link>
        </div>
      </div>

      {/* TAB 1: WEBSITE CONTENT */}
      {tab === 'content' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Hero Section Text
            </h3>

            <div className="form-group">
              <label className="form-label">Hero Headline</label>
              <input
                type="text"
                className="form-control"
                value={settings.heroHeadline || ''}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero Subtext</label>
              <textarea
                rows={3}
                className="form-control"
                value={settings.heroSubtext || ''}
                onChange={(e) => setSettings({ ...settings, heroSubtext: e.target.value })}
              />
            </div>

            <h3 style={{ fontSize: '1.125rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
              About Section & Story
            </h3>

            <div className="form-group">
              <label className="form-label">Company About Overview</label>
              <textarea
                rows={4}
                className="form-control"
                value={settings.aboutStory || ''}
                onChange={(e) => setSettings({ ...settings, aboutStory: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: 'fit-content' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Content Changes'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: FAQS */}
      {tab === 'faqs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({ question: '', answer: '', category: 'General', displayOrder: faqs.length + 1 });
                setFaqModal(true);
              }}
            >
              <PlusCircle size={16} /> Add FAQ
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((f) => (
                  <tr key={f._id}>
                    <td>#{f.displayOrder}</td>
                    <td><strong>{f.question}</strong></td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8125rem' }}>{f.answer}</td>
                    <td><Badge status={f.category} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditingFaq(f);
                            setFaqForm({ question: f.question, answer: f.answer, category: f.category || 'General', displayOrder: f.displayOrder || 0 });
                            setFaqModal(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--danger)', background: 'none', border: '1px solid #FECACA' }}
                          onClick={() => handleDeleteFaq(f._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TESTIMONIALS */}
      {tab === 'testimonials' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingTestimonial(null);
                setTestForm({ name: '', location: 'Jaipur', rating: 5, comment: '', serviceUsed: 'Home Relocation', isApproved: true });
                setTestimonialModal(true);
              }}
            >
              <PlusCircle size={16} /> Add Testimonial
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Location & Service</th>
                  <th>Rating</th>
                  <th>Review Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.location} • <span style={{ color: 'var(--brand-orange)' }}>{t.serviceUsed}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.125rem' }}>
                        {[...Array(t.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8125rem', fontStyle: 'italic' }}>"{t.comment}"</td>
                    <td><Badge status={t.isApproved ? 'Approved' : 'Pending'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditingTestimonial(t);
                            setTestForm({ name: t.name, location: t.location, rating: t.rating || 5, comment: t.comment, serviceUsed: t.serviceUsed, isApproved: t.isApproved });
                            setTestimonialModal(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--danger)', background: 'none', border: '1px solid #FECACA' }}
                          onClick={() => handleDeleteTestimonial(t._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      <Modal
        isOpen={faqModal}
        onClose={() => setFaqModal(false)}
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
      >
        <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Question *</label>
            <input
              type="text"
              required
              className="form-control"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Answer *</label>
            <textarea
              rows={3}
              required
              className="form-control"
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={faqForm.category}
                onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Order</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={faqForm.displayOrder}
                onChange={(e) => setFaqForm({ ...faqForm, displayOrder: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setFaqModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save FAQ</button>
          </div>
        </form>
      </Modal>

      {/* Testimonial Modal */}
      <Modal
        isOpen={testimonialModal}
        onClose={() => setTestimonialModal(false)}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSaveTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={testForm.name}
                onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Route / Location *</label>
              <input
                type="text"
                required
                className="form-control"
                value={testForm.location}
                onChange={(e) => setTestForm({ ...testForm, location: e.target.value })}
                placeholder="e.g. Jaipur to Delhi"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Service Used</label>
              <input
                type="text"
                className="form-control"
                value={testForm.serviceUsed}
                onChange={(e) => setTestForm({ ...testForm, serviceUsed: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating (1-5)</label>
              <select
                className="form-control"
                value={testForm.rating}
                onChange={(e) => setTestForm({ ...testForm, rating: Number(e.target.value) })}
              >
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Good)</option>
                <option value={3}>3 Stars (Average)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Comment *</label>
            <textarea
              rows={3}
              required
              className="form-control"
              value={testForm.comment}
              onChange={(e) => setTestForm({ ...testForm, comment: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setTestimonialModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save Testimonial</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminContent;

