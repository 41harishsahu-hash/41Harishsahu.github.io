import React, { useState, useEffect } from 'react';
import {
  Sliders,
  PlusCircle,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Cloud,
  HardDrive,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Image as ImageIcon,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { adminAPI, contentAPI } from '../../services/api';
import { Modal, LoadingSpinner, Alert } from '../../components/CommonUI';
import { HeroCarousel } from '../../components/HeroCarousel';

export const AdminCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ isCloudinaryConfigured: false });
  const [previewMode, setPreviewMode] = useState(false);

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    displayOrder: 0,
    isActive: true,
    isPublished: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Load Slides
  const loadSlides = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [slidesRes, statusRes] = await Promise.all([
        adminAPI.getAdminHeroCarousel(),
        adminAPI.getUploadStatus().catch(() => ({ data: { isCloudinaryConfigured: false } })),
      ]);

      if (slidesRes.data?.success) {
        setSlides(slidesRes.data.data || []);
      }
      if (statusRes.data?.success) {
        setUploadStatus(statusRes.data);
      }
    } catch (err) {
      console.error('Carousel load error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load hero carousel slides.';
      setFetchError(errMsg);
      setMsg({ type: 'danger', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit form (create or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !editingSlide) {
      alert('Please select an image file to upload.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(true);
    setMsg(null);

    try {
      let imageUrl = editingSlide?.imageUrl || '';
      let publicId = editingSlide?.publicId || '';

      // Upload image if a new file is chosen
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('folder', 'history-packers/hero');

        const uploadRes = await adminAPI.uploadImage(formData);
        if (uploadRes.data?.success) {
          imageUrl = uploadRes.data.data.url;
          publicId = uploadRes.data.data.publicId;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
        isPublished: form.isPublished,
        imageUrl,
        publicId,
      };

      if (editingSlide) {
        await adminAPI.updateHeroCarouselSlide(editingSlide._id, payload);
        setMsg({ type: 'success', text: 'Carousel slide updated successfully!' });
      } else {
        await adminAPI.createHeroCarouselSlide(payload);
        setMsg({ type: 'success', text: 'Carousel slide uploaded and published successfully!' });
      }

      setAddModal(false);
      setEditModal(false);
      setEditingSlide(null);
      setSelectedFile(null);
      setPreviewUrl('');
      loadSlides();
    } catch (err) {
      setMsg({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Operation failed.',
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (slide) => {
    try {
      const nextActive = !slide.isActive;
      await adminAPI.updateHeroCarouselSlide(slide._id, { isActive: nextActive });
      setSlides((prev) =>
        prev.map((s) => (s._id === slide._id ? { ...s, isActive: nextActive } : s))
      );
    } catch (err) {
      alert('Failed to update active status.');
    }
  };

  // Toggle published status
  const handleTogglePublished = async (slide) => {
    try {
      const nextPublished = !slide.isPublished;
      await adminAPI.updateHeroCarouselSlide(slide._id, { isPublished: nextPublished });
      setSlides((prev) =>
        prev.map((s) => (s._id === slide._id ? { ...s, isPublished: nextPublished } : s))
      );
    } catch (err) {
      alert('Failed to update publish status.');
    }
  };

  // Move slide up or down
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Reassign sequential display orders
    const items = newSlides.map((s, idx) => ({ id: s._id, displayOrder: idx + 1 }));
    setSlides(newSlides.map((s, idx) => ({ ...s, displayOrder: idx + 1 })));

    try {
      await adminAPI.reorderHeroCarousel(items);
    } catch (err) {
      alert('Failed to save new order.');
      loadSlides();
    }
  };

  // Delete slide
  const handleDelete = async (id, title) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete this carousel image? The associated image asset will also be removed.`
      )
    ) {
      return;
    }

    try {
      await adminAPI.deleteHeroCarouselSlide(id);
      setMsg({ type: 'success', text: 'Carousel slide removed.' });
      setSlides((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Failed to delete slide.');
    }
  };

  // Open edit modal
  const openEditModal = (slide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title || '',
      description: slide.description || '',
      displayOrder: slide.displayOrder ?? 0,
      isActive: slide.isActive !== false,
      isPublished: slide.isPublished !== false,
    });
    setSelectedFile(null);
    setPreviewUrl(slide.imageUrl);
    setEditModal(true);
  };

  // Filter active & published slides for live preview
  const livePreviewSlides = slides.filter(
    (s) => s.isActive !== false && s.isPublished !== false
  );

  return (
    <div className="admin-carousel">
      {/* Page Header */}
      <div
        className="dashboard-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              color: 'var(--brand-navy)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              margin: 0,
            }}
          >
            <Sliders size={26} color="var(--brand-orange)" /> Hero Carousel Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
            Dynamically upload, manage, reorder, and preview background slides displayed on the homepage hero section.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`btn ${previewMode ? 'btn-navy' : 'btn-outline'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Eye size={16} /> {previewMode ? 'Hide Live Preview' : 'Preview Live Carousel'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingSlide(null);
              setForm({
                title: '',
                description: '',
                displayOrder: slides.length + 1,
                isActive: true,
                isPublished: true,
              });
              setSelectedFile(null);
              setPreviewUrl('');
              setAddModal(true);
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <PlusCircle size={16} /> Add Carousel Image
          </button>
        </div>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Slides</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', margin: '0.25rem 0 0 0' }}>{slides.length}</h2>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>Active in Rotation</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--success)', margin: '0.25rem 0 0 0' }}>
            {livePreviewSlides.length}
          </h2>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 600 }}>Inactive / Drafts</span>
          <h2 style={{ fontSize: '1.75rem', color: '#F59E0B', margin: '0.25rem 0 0 0' }}>
            {slides.filter((s) => !s.isActive || !s.isPublished).length}
          </h2>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Storage Backend</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {uploadStatus.isCloudinaryConfigured ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: 'var(--success)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                <Cloud size={16} /> Cloudinary Active
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: 'var(--brand-navy)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                <HardDrive size={16} color="var(--brand-orange)" /> Local Storage Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Mode Accordion */}
      {previewMode && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.125rem' }}>
              Live Hero Carousel Simulation ({livePreviewSlides.length} Active Slides)
            </h3>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
              Transitions automatically every 5 seconds
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#1E293B',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <HeroCarousel slides={livePreviewSlides} />
            <div
              style={{
                position: 'absolute',
                top: '1.5rem',
                left: '2rem',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <h2 style={{ color: 'var(--brand-navy)', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                Moving Made Simple. <span style={{ color: 'var(--brand-orange)' }}>Moving Made Safe.</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem', maxWidth: '380px' }}>
                Live overlay simulation showing high contrast and background readability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slides Table */}
      {loading ? (
        <LoadingSpinner text="Loading hero carousel slides..." />
      ) : fetchError ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <AlertTriangle size={28} color="#DC2626" />
          </div>
          <h3 style={{ fontSize: '1.125rem', color: '#991B1B', marginBottom: '0.5rem' }}>
            Unable to Load Carousel Data
          </h3>
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {fetchError}
          </p>
          <button
            type="button"
            onClick={loadSlides}
            className="btn btn-navy btn-sm"
          >
            Retry Loading
          </button>
        </div>
      ) : slides.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <ImageIcon size={28} color="var(--text-secondary)" />
          </div>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            No carousel background slides configured
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Add your first moving or logistics background photo to activate the homepage slideshow.
          </p>
          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} /> Add First Slide
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', width: '60px' }}>Order</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', width: '110px' }}>Preview</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>Slide Information</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', textAlign: 'center' }}>Active</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', textAlign: 'center' }}>Published</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide, idx) => (
                  <tr
                    key={slide._id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: !slide.isActive || !slide.isPublished ? '#FFFBEB' : 'transparent',
                    }}
                  >
                    {/* Order Controls */}
                    <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'up')}
                          disabled={idx === 0}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.3 : 1,
                            padding: '0.1rem',
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>
                          {slide.displayOrder ?? idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'down')}
                          disabled={idx === slides.length - 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: idx === slides.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === slides.length - 1 ? 0.3 : 1,
                            padding: '0.1rem',
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                      <div
                        style={{
                          width: '96px',
                          height: '56px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#E2E8F0',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <img
                          src={slide.imageUrl}
                          alt={slide.title || 'Slide'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>

                    {/* Information */}
                    <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                      <strong style={{ display: 'block', color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>
                        {slide.title || <span style={{ color: 'var(--text-muted)' }}>(No Title)</span>}
                      </strong>
                      {slide.description && (
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {slide.description}
                        </p>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '0.2rem' }}>
                        URL: {slide.imageUrl.slice(0, 45)}...
                      </span>
                    </td>

                    {/* Active in Rotation */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: slide.isActive !== false ? 'rgba(22, 163, 74, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                          color: slide.isActive !== false ? 'var(--success)' : 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                        title="Click to toggle rotation"
                      >
                        {slide.isActive !== false ? <Play size={11} fill="var(--success)" /> : <Pause size={11} />}
                        {slide.isActive !== false ? 'Active' : 'Paused'}
                      </button>
                    </td>

                    {/* Published */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(slide)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: slide.isPublished !== false ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.1)',
                          color: slide.isPublished !== false ? 'var(--success)' : 'var(--error)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                        title="Click to toggle public display"
                      >
                        {slide.isPublished !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        {slide.isPublished !== false ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(slide)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.375rem 0.5rem' }}
                          title="Edit slide"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(slide._id, slide.title)}
                          className="btn btn-sm"
                          style={{ padding: '0.375rem 0.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}
                          title="Delete slide"
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

      {/* Add / Edit Slide Modal */}
      {(addModal || editModal) && (
        <Modal
          isOpen={addModal || editModal}
          title={editModal ? 'Edit Carousel Slide' : 'Add New Hero Carousel Image'}
          onClose={() => {
            setAddModal(false);
            setEditModal(false);
            setEditingSlide(null);
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Image Upload Area */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Background Image {!editingSlide && <span style={{ color: 'var(--error)' }}>*</span>}
              </label>

              {previewUrl && (
                <div
                  style={{
                    marginBottom: '0.75rem',
                    width: '100%',
                    height: '180px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="form-control"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                Recommended: 1920x1080 resolution, JPG/PNG/WebP (Max 8MB). High contrast imagery looks best with subtle overlay.
              </span>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Slide Title <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional badge caption)</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Household Relocation in Action"
                className="form-control"
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Multi-layer protective packaging for safe transit"
                className="form-control"
              />
            </div>

            {/* Display Order */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Display Order
              </label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="form-control"
              />
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active in automatic rotation
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                Publicly published
              </label>
            </div>

            {uploadProgress && (
              <div style={{ padding: '0.5rem', backgroundColor: '#F0F9FF', borderRadius: '4px', fontSize: '0.8125rem', color: '#0284C7' }}>
                Uploading image and updating database records...
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setAddModal(false);
                  setEditModal(false);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'Saving Slide...' : editModal ? 'Update Slide' : 'Save & Publish Slide'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminCarousel;

