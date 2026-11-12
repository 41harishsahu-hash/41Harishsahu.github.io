import React, { useState, useEffect } from 'react';
import { Truck, PlusCircle, Edit, Trash2, Eye, EyeOff, Check, X, Upload } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Modal, LoadingSpinner, Alert } from '../../components/CommonUI';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit'
  const [selectedService, setSelectedService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    icon: 'Truck',
    shortDescription: '',
    fullDescription: '',
    benefitsString: '',
    displayOrder: 0,
    isActive: true,
    imageUrl: '',
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdminServices();
      if (res.data?.success) {
        setServices(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setSelectedService(null);
    setFormData({
      title: '',
      slug: '',
      icon: 'Truck',
      shortDescription: '',
      fullDescription: '',
      benefitsString: 'Multi-layer protective packing\nDoor-to-door delivery\nDedicated moving crew',
      displayOrder: services.length + 1,
      isActive: true,
      imageUrl: '',
    });
    setMsg(null);
    setActiveModal('create');
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      icon: service.icon || 'Truck',
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      benefitsString: (service.benefits || []).join('\n'),
      displayOrder: service.displayOrder || 0,
      isActive: service.isActive !== false,
      imageUrl: service.image?.url || '',
    });
    setMsg(null);
    setActiveModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMsg(null);

    const payload = {
      title: formData.title,
      slug: formData.slug || undefined,
      icon: formData.icon,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      benefits: formData.benefitsString.split('\n').map((s) => s.trim()).filter(Boolean),
      displayOrder: Number(formData.displayOrder),
      isActive: formData.isActive,
      image: formData.imageUrl ? { url: formData.imageUrl } : undefined,
    };

    try {
      if (activeModal === 'create') {
        const res = await adminAPI.createService(payload);
        if (res.data?.success) {
          setActiveModal(null);
          fetchServices();
        }
      } else {
        const res = await adminAPI.updateService(selectedService._id, payload);
        if (res.data?.success) {
          setActiveModal(null);
          fetchServices();
        }
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to save service' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the service "${title}"?`)) return;
    try {
      await adminAPI.deleteService(id);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  const toggleActive = async (service) => {
    try {
      await adminAPI.updateService(service._id, { isActive: !service.isActive });
      fetchServices();
    } catch (err) {
      alert('Failed to update visibility');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Relocation Services Management</h2>
          <p>Add, edit, and organize services displayed on the public website</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <PlusCircle size={16} /> Add New Service
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading services..." />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Service Title</th>
                <th>Slug</th>
                <th>Icon</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc._id}>
                  <td><strong>#{svc.displayOrder}</strong></td>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>{svc.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {svc.shortDescription}
                    </div>
                  </td>
                  <td><code>{svc.slug}</code></td>
                  <td>{svc.icon}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        backgroundColor: svc.isActive ? '#F0FDF4' : '#FEF2F2',
                        color: svc.isActive ? 'var(--success)' : 'var(--danger)',
                        border: '1px solid currentColor',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      onClick={() => toggleActive(svc)}
                    >
                      {svc.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{svc.isActive ? 'Active (Live)' : 'Hidden'}</span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(svc)}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ color: 'var(--danger)', background: 'none', border: '1px solid #FECACA' }}
                        onClick={() => handleDelete(svc._id, svc.title)}
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
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
        title={activeModal === 'create' ? 'Add New Relocation Service' : `Edit: ${selectedService?.title}`}
      >
        {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Service Title *</label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Home Relocation"
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug (Auto-generated if empty)</label>
              <input
                type="text"
                className="form-control"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. home-relocation"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Lucide Icon</label>
              <select
                className="form-control"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                <option value="Truck">Truck</option>
                <option value="Home">Home</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Building">Building</option>
                <option value="Store">Store</option>
                <option value="Package">Package</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Inactive (Draft)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description (Cards & Previews) *</label>
            <textarea
              rows={2}
              required
              className="form-control"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="10-300 characters describing the service..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Service Description (Detail Page) *</label>
            <textarea
              rows={4}
              required
              className="form-control"
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              placeholder="Comprehensive description of materials, handling, and logistics..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Benefits (One per line)</label>
            <textarea
              rows={3}
              className="form-control"
              value={formData.benefitsString}
              onChange={(e) => setFormData({ ...formData, benefitsString: e.target.value })}
              placeholder="Multi-layer protective packing&#10;Dismantling & assembly of furniture&#10;Covered transport vehicles"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input
              type="text"
              className="form-control"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://... or Cloudinary image link"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>
              Cancel
            </button>
            <button type="submit" disabled={formLoading} className="btn btn-primary btn-sm">
              {formLoading ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServices;

