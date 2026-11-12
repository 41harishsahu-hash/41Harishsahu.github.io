import React, { useState, useEffect } from 'react';
import {
  Camera,
  PlusCircle,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Cloud,
  HardDrive,
  Calendar,
  MapPin,
  ArrowUpDown,
  Filter,
  Image as ImageIcon,
  X,
  Save,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Modal, LoadingSpinner, Alert, Badge } from '../../components/CommonUI';
import { GalleryLightbox } from '../../components/GalleryLightbox';

const CATEGORIES = [
  'Household Shifting',
  'Office Relocation',
  'Packing & Protection',
  'Vehicle Transportation',
  'Commercial Shifting',
];

export const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ isCloudinaryConfigured: false });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [batchModal, setBatchModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Single Form State
  const [singleForm, setSingleForm] = useState({
    title: '',
    category: 'Household Shifting',
    description: '',
    projectDate: new Date().toISOString().split('T')[0],
    location: 'Jaipur',
    displayOrder: 0,
    isPublished: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Batch Form State
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchCategory, setBatchCategory] = useState('Household Shifting');
  const [batchLocation, setBatchLocation] = useState('Jaipur');

  // Load Data
  const loadGallery = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [galRes, statusRes] = await Promise.all([
        adminAPI.getAdminGallery(),
        adminAPI.getUploadStatus().catch(() => ({ data: { isCloudinaryConfigured: false } })),
      ]);

      if (galRes.data?.success) {
        setGallery(galRes.data.data || []);
      }
      if (statusRes.data?.success) {
        setUploadStatus(statusRes.data);
      }
    } catch (err) {
      console.error('Gallery load error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load gallery items.';
      setFetchError(errMsg);
      setMsg({ type: 'danger', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // Handle file select for single item
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

  // Handle single item submission
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !editingItem) {
      alert('Please select an image file to upload.');
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      let imageUrl = editingItem?.imageUrl || '';
      let publicId = editingItem?.publicId || '';

      // Upload image if new file selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('folder', 'history-packers/gallery');

        const uploadRes = await adminAPI.uploadImage(formData);
        if (uploadRes.data?.success) {
          imageUrl = uploadRes.data.data.url;
          publicId = uploadRes.data.data.publicId;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const payload = {
        title: singleForm.title,
        category: singleForm.category,
        description: singleForm.description,
        projectDate: singleForm.projectDate,
        location: singleForm.location,
        displayOrder: Number(singleForm.displayOrder) || 0,
        isPublished: singleForm.isPublished,
        isActive: singleForm.isPublished,
        imageUrl,
        publicId,
      };

      if (editingItem) {
        await adminAPI.updateGalleryItem(editingItem._id, payload);
        setMsg({ type: 'success', text: 'Gallery project updated successfully!' });
      } else {
        await adminAPI.createGalleryItem(payload);
        setMsg({ type: 'success', text: 'Gallery project published successfully!' });
      }

      setAddModal(false);
      setEditModal(false);
      setEditingItem(null);
      setSelectedFile(null);
      setPreviewUrl('');
      loadGallery();
    } catch (err) {
      setMsg({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Operation failed.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle batch file selection
  const handleBatchFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      alert('You can upload up to 10 images at once.');
      return;
    }
    setBatchFiles(files);
  };

  // Handle batch upload submit
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (batchFiles.length === 0) {
      alert('Please select one or more images to upload.');
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const formData = new FormData();
      batchFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('folder', 'history-packers/gallery');

      const uploadRes = await adminAPI.uploadMultipleImages(formData);
      if (!uploadRes.data?.success || !uploadRes.data.data) {
        throw new Error('Batch image upload failed.');
      }

      const uploadedList = uploadRes.data.data;

      // Create a gallery record for each uploaded image
      const createPromises = uploadedList.map((item, idx) => {
        let titleName = batchFiles[idx]?.name
          ? batchFiles[idx].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          : `Relocation Project ${gallery.length + idx + 1}`;

        if (titleName.trim().length < 2) {
          titleName = `Relocation Project ${gallery.length + idx + 1}`;
        }

        return adminAPI.createGalleryItem({
          title: titleName.charAt(0).toUpperCase() + titleName.slice(1),
          category: batchCategory,
          description: `Verified shifting work executed in ${batchLocation}.`,
          projectDate: new Date(),
          location: batchLocation,
          displayOrder: gallery.length + idx,
          isPublished: true,
          isActive: true,
          imageUrl: item.url,
          publicId: item.publicId,
        });
      });

      await Promise.all(createPromises);

      setMsg({
        type: 'success',
        text: `Successfully uploaded and created ${uploadedList.length} gallery projects!`,
      });
      setBatchModal(false);
      setBatchFiles([]);
      loadGallery();
    } catch (err) {
      setMsg({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Batch upload failed.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (item) => {
    try {
      const nextPub = !item.isPublished;
      await adminAPI.updateGalleryItem(item._id, {
        isPublished: nextPub,
        isActive: nextPub,
      });
      setGallery((prev) =>
        prev.map((g) => (g._id === item._id ? { ...g, isPublished: nextPub, isActive: nextPub } : g))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Delete gallery item
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? The associated image asset will also be removed.`)) {
      return;
    }

    try {
      await adminAPI.deleteGalleryItem(id);
      setMsg({ type: 'success', text: `Project "${title}" deleted.` });
      setGallery((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setSingleForm({
      title: item.title,
      category: item.category || 'Household Shifting',
      description: item.description || '',
      projectDate: item.projectDate ? new Date(item.projectDate).toISOString().split('T')[0] : '',
      location: item.location || 'Jaipur',
      displayOrder: item.displayOrder || 0,
      isPublished: item.isPublished !== false,
    });
    setSelectedFile(null);
    setPreviewUrl(item.imageUrl);
    setEditModal(true);
  };

  // Filter gallery
  const filteredGallery = gallery.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Published' && item.isPublished !== false) ||
      (statusFilter === 'Draft' && item.isPublished === false);
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="admin-gallery">
      {/* Page Header */}
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.625rem', margin: 0 }}>
            <Camera size={26} color="var(--brand-orange)" /> Work Gallery Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
            Manage real moving project photographs, descriptions, categories, and public display visibility.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setBatchModal(true);
            }}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Upload size={16} /> Batch Upload Images
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setSingleForm({
                title: '',
                category: 'Household Shifting',
                description: '',
                projectDate: new Date().toISOString().split('T')[0],
                location: 'Jaipur',
                displayOrder: gallery.length,
                isPublished: true,
              });
              setSelectedFile(null);
              setPreviewUrl('');
              setAddModal(true);
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <PlusCircle size={16} /> Add Single Project
          </button>
        </div>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Projects</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', margin: '0.25rem 0 0 0' }}>{gallery.length}</h2>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>Publicly Published</span>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--success)', margin: '0.25rem 0 0 0' }}>
            {gallery.filter((g) => g.isPublished !== false).length}
          </h2>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 600 }}>Drafts / Hidden</span>
          <h2 style={{ fontSize: '1.75rem', color: '#F59E0B', margin: '0.25rem 0 0 0' }}>
            {gallery.filter((g) => g.isPublished === false).length}
          </h2>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Image Storage Engine</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {uploadStatus.isCloudinaryConfigured ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.875rem' }}>
                <Cloud size={16} /> Cloudinary Active
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--brand-navy)', fontWeight: 700, fontSize: '0.875rem' }}>
                <HardDrive size={16} color="var(--brand-orange)" /> Local Fallback Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div
        style={{
          backgroundColor: 'rgba(23, 54, 93, 0.04)',
          borderLeft: '4px solid var(--brand-navy)',
          padding: '0.875rem 1.25rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--brand-navy)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <AlertTriangle size={18} color="var(--brand-orange)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Privacy Safeguard Protocol:</strong> Never upload photographs showing clear customer faces, Aadhaar/PAN cards, moving invoices with private contact numbers, or unblurred vehicle registration plates without customer permission.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Drafts Only</option>
            </select>
          </div>
        </div>

        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Showing {filteredGallery.length} of {gallery.length} items
        </span>
      </div>

      {/* Projects Table / Card Grid */}
      {loading ? (
        <LoadingSpinner text="Loading gallery..." />
      ) : fetchError ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <AlertTriangle size={28} color="#DC2626" />
          </div>
          <h3 style={{ fontSize: '1.125rem', color: '#991B1B', marginBottom: '0.5rem' }}>
            Unable to Load Gallery Data
          </h3>
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {fetchError}
          </p>
          <button
            type="button"
            onClick={loadGallery}
            className="btn btn-navy btn-sm"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <ImageIcon size={28} color="var(--text-secondary)" />
          </div>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            No gallery projects found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Upload real company moving photographs to populate the website gallery.
          </p>
          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} /> Add First Project
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', width: '90px' }}>Thumbnail</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>Project Details</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>Category</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>Date & Hub</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', textAlign: 'center' }}>Order</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGallery.map((item, idx) => (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: item.isPublished === false ? '#FFFBEB' : 'transparent',
                    }}
                  >
                    {/* Thumbnail */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div
                        style={{
                          width: '76px',
                          height: '52px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#E2E8F0',
                          cursor: 'pointer',
                          border: '1px solid var(--border-color)',
                          position: 'relative',
                        }}
                        onClick={() => setLightboxIndex(idx)}
                        title="Click to view full image"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>

                    {/* Details */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <strong style={{ display: 'block', color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>
                        {item.title}
                      </strong>
                      {item.description && (
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.4 }}>
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(23, 54, 93, 0.08)',
                          color: 'var(--brand-navy)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {item.category || 'Relocation'}
                      </span>
                    </td>

                    {/* Date & Location */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div>{item.location || 'Jaipur'}</div>
                      <div style={{ fontSize: '0.75rem' }}>
                        {item.projectDate ? new Date(item.projectDate).toLocaleDateString('en-IN') : 'Recent'}
                      </div>
                    </td>

                    {/* Order */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                      {item.displayOrder ?? 0}
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: item.isPublished !== false ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.1)',
                          color: item.isPublished !== false ? 'var(--success)' : 'var(--error)',
                        }}
                        title="Click to toggle publish status"
                      >
                        {item.isPublished !== false ? (
                          <>
                            <Eye size={12} /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(idx)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.375rem 0.5rem' }}
                          title="Preview full photo"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.375rem 0.5rem' }}
                          title="Edit project details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id, item.title)}
                          className="btn btn-sm"
                          style={{ padding: '0.375rem 0.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}
                          title="Delete project"
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

      {/* Lightbox Preview */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={filteredGallery}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {/* Add / Edit Single Modal */}
      {(addModal || editModal) && (
        <Modal
          isOpen={addModal || editModal}
          title={editModal ? 'Edit Project Details' : 'Add New Shifting Project'}
          onClose={() => {
            setAddModal(false);
            setEditModal(false);
            setEditingItem(null);
          }}
        >
          <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Image upload area */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Project Photograph {!editingItem && <span style={{ color: 'var(--error)' }}>*</span>}
              </label>

              {previewUrl && (
                <div style={{ marginBottom: '0.75rem', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F1F5F9', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="form-control"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                Supported formats: JPEG, PNG, WebP (Max 8MB). Photos should feature real moving work.
              </span>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Project Title <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={singleForm.title}
                onChange={(e) => setSingleForm({ ...singleForm, title: e.target.value })}
                placeholder="e.g. 3 BHK Household Shifting in Vaishali Nagar"
                className="form-control"
              />
            </div>

            {/* Category & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  Category
                </label>
                <select
                  value={singleForm.category}
                  onChange={(e) => setSingleForm({ ...singleForm, category: e.target.value })}
                  className="form-control"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  City / Location
                </label>
                <input
                  type="text"
                  value={singleForm.location}
                  onChange={(e) => setSingleForm({ ...singleForm, location: e.target.value })}
                  placeholder="e.g. Mansarovar, Jaipur"
                  className="form-control"
                />
              </div>
            </div>

            {/* Date & Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  Project Date
                </label>
                <input
                  type="date"
                  value={singleForm.projectDate}
                  onChange={(e) => setSingleForm({ ...singleForm, projectDate: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={singleForm.displayOrder}
                  onChange={(e) => setSingleForm({ ...singleForm, displayOrder: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Short Description
              </label>
              <textarea
                rows={3}
                value={singleForm.description}
                onChange={(e) => setSingleForm({ ...singleForm, description: e.target.value })}
                placeholder="Highlight packing materials used, vehicle type, or specific handling..."
                className="form-control"
              />
            </div>

            {/* Published Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="isPublished"
                checked={singleForm.isPublished}
                onChange={(e) => setSingleForm({ ...singleForm, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                Publish immediately to public website
              </label>
            </div>

            {/* Actions */}
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
                {submitting ? 'Saving Project...' : editModal ? 'Update Project' : 'Publish Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Batch Upload Modal */}
      {batchModal && (
        <Modal
          isOpen={batchModal}
          title="Batch Upload Project Images"
          onClose={() => setBatchModal(false)}
        >
          <form onSubmit={handleBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select multiple photos from completed moves. Each image will be cataloged as a separate project with the chosen category and location.
            </p>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                Select Image Files (Up to 10) <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBatchFileChange}
                className="form-control"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                {batchFiles.length} file(s) selected
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  Default Category
                </label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                  className="form-control"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  Default City / Hub
                </label>
                <input
                  type="text"
                  value={batchLocation}
                  onChange={(e) => setBatchLocation(e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setBatchModal(false)} className="btn btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || batchFiles.length === 0}
                className="btn btn-primary"
              >
                {submitting ? 'Uploading Batch...' : `Upload ${batchFiles.length} Photos`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminGallery;

