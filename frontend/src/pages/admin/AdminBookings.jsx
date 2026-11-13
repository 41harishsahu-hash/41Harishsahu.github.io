import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  PlusCircle,
  Eye,
  Trash2,
  Truck,
  IndianRupee,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { Badge, Modal, Alert, LoadingSpinner, Pagination } from '../../components/CommonUI';

const BOOKING_STATUSES = ['All', 'Pending', 'Confirmed', 'Packing', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['All', 'Pending', 'Partial', 'Paid'];

export const AdminBookings = () => {
  const [searchParams] = useSearchParams();
  const directId = searchParams.get('id');

  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');

  // Modal State
  const [activeBooking, setActiveBooking] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Edit / Update fields
  const [editStatus, setEditStatus] = useState('Confirmed');
  const [editQuoteAmount, setEditQuoteAmount] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState('Pending');
  const [editPaidAmount, setEditPaidAmount] = useState(0);
  const [trackingLocation, setTrackingLocation] = useState('');
  const [trackingRemarks, setTrackingRemarks] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Create Direct Booking Form State
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    pickupAddress: '',
    destinationAddress: '',
    pickupCity: 'Jaipur',
    destinationCity: '',
    serviceType: 'Home Relocation',
    movingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    quoteAmount: 15000,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    paidAmount: 0,
    paymentNotes: '',
    remarks: 'Direct booking created by admin.',
  });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll({
        search,
        status: status === 'All' ? undefined : status,
        paymentStatus: paymentStatus === 'All' ? undefined : paymentStatus,
        page,
        limit: 10,
      });

      if (res.data?.success) {
        setBookings(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);

        if (directId) {
          const matched = res.data.data.find((b) => b._id === directId);
          if (matched) {
            openBookingModal(matched);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, paymentStatus, page, directId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const openBookingModal = (bk) => {
    setActiveBooking(bk);
    setEditStatus(bk.status);
    setEditQuoteAmount(bk.quoteAmount || 0);
    setEditPaymentStatus(bk.paymentStatus || 'Pending');
    setEditPaidAmount(bk.paidAmount || 0);
    setTrackingLocation('');
    setTrackingRemarks('');
    setInternalNote('');
    setMessage(null);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await bookingAPI.update(activeBooking._id, {
        status: editStatus,
        quoteAmount: Number(editQuoteAmount),
        paymentStatus: editPaymentStatus,
        paidAmount: Number(editPaidAmount),
        trackingLocation,
        trackingRemarks,
        internalNote,
      });

      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Booking and tracking updated successfully!' });
        setActiveBooking(res.data.data);
        fetchBookings();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update booking.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await bookingAPI.create({
        ...createForm,
        quoteAmount: Number(createForm.quoteAmount),
        paidAmount: Number(createForm.paidAmount),
      });

      if (res.data?.success) {
        alert(`Booking #${res.data.data?.bookingNumber} created successfully!`);
        setIsCreateOpen(false);
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    try {
      await bookingAPI.delete(id);
      setActiveBooking(null);
      fetchBookings();
    } catch (err) {
      alert('Failed to delete booking.');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Bookings & Logistics Management</h2>
          <p>Track live dispatches, update delivery milestones, and manage payment records</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <PlusCircle size={16} /> Create Direct Booking
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search booking #, customer name, phone, or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <select
            className="form-control"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <select
            className="form-control"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
          >
            {PAYMENT_STATUSES.map((p) => (
              <option key={p} value={p}>Payment: {p}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <CalendarCheck size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Bookings Found</h3>
          <p>No moving bookings match your selected criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Quote / Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((bk) => (
                  <tr key={bk._id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)' }}>{bk.bookingNumber}</strong>
                    </td>
                    <td><strong>{bk.customerName}</strong></td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{bk.customerMobile}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bk.customerEmail}</div>
                    </td>
                    <td>{bk.serviceType}</td>
                    <td>{bk.pickupCity} → {bk.destinationCity}</td>
                    <td>{new Date(bk.movingDate).toLocaleDateString()}</td>
                    <td><Badge status={bk.status} /></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                        ₹{(bk.quoteAmount || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>
                        Paid: ₹{(bk.paidAmount || 0).toLocaleString()} (<Badge status={bk.paymentStatus} />)
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openBookingModal(bk)}
                        >
                          <Eye size={14} /> Update
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--danger)', background: 'none', border: '1px solid #FECACA' }}
                          onClick={() => handleDeleteBooking(bk._id)}
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

          <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => setPage(p)} />
        </>
      )}

      {/* Edit Booking & Push Tracking Modal */}
      <Modal
        isOpen={Boolean(activeBooking)}
        onClose={() => setActiveBooking(null)}
        title={`Update Booking #${activeBooking?.bookingNumber}`}
      >
        {activeBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem' }}>
            {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

            {/* Quick Overview */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div><strong>Customer:</strong> {activeBooking.customerName} ({activeBooking.customerMobile})</div>
                <div><strong>Service:</strong> {activeBooking.serviceType}</div>
              </div>
              <div>
                <strong>Route:</strong> {activeBooking.pickupAddress}, {activeBooking.pickupCity} → {activeBooking.destinationAddress}, {activeBooking.destinationCity}
              </div>
            </div>

            <form onSubmit={handleUpdateBooking}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--brand-navy)' }}>
                1. Relocation & Tracking Milestones
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="editStatus">Booking Tracking Status</label>
                  <select
                    id="editStatus"
                    className="form-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    {BOOKING_STATUSES.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="trackingLocation">Current Location / Checkpoint</label>
                  <input
                    type="text"
                    id="trackingLocation"
                    className="form-control"
                    placeholder="e.g. Jaipur Bypass, Kotputli Highway"
                    value={trackingLocation}
                    onChange={(e) => setTrackingLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="trackingRemarks">Tracking Remarks (Visible to customer)</label>
                <input
                  type="text"
                  id="trackingRemarks"
                  className="form-control"
                  placeholder="e.g. Packing completed. Vehicle RJ-14 dispatched towards destination."
                  value={trackingRemarks}
                  onChange={(e) => setTrackingRemarks(e.target.value)}
                />
              </div>

              <h4 style={{ fontSize: '1rem', margin: '1.25rem 0 0.75rem 0', color: 'var(--brand-navy)' }}>
                2. Quotation & Payment Management
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="editQuote">Total Quote (₹)</label>
                  <input
                    type="number"
                    id="editQuote"
                    min={0}
                    className="form-control"
                    value={editQuoteAmount}
                    onChange={(e) => setEditQuoteAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editPaid">Paid Amount (₹)</label>
                  <input
                    type="number"
                    id="editPaid"
                    min={0}
                    className="form-control"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editPaymentStatus">Payment Status</label>
                  <select
                    id="editPaymentStatus"
                    className="form-control"
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="internalNote">Add Internal Admin Note</label>
                <input
                  type="text"
                  id="internalNote"
                  className="form-control"
                  placeholder="e.g. Driver Ramesh (+91 98...) assigned."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveBooking(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                  {actionLoading ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Create Direct Booking Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Relocation Booking"
      >
        <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={createForm.customerName}
                onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                required
                className="form-control"
                value={createForm.customerMobile}
                onChange={(e) => setCreateForm({ ...createForm, customerMobile: e.target.value })}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Customer Email *</label>
            <input
              type="email"
              required
              className="form-control"
              value={createForm.customerEmail}
              onChange={(e) => setCreateForm({ ...createForm, customerEmail: e.target.value })}
              placeholder="name@example.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pickup City *</label>
              <input
                type="text"
                required
                className="form-control"
                value={createForm.pickupCity}
                onChange={(e) => setCreateForm({ ...createForm, pickupCity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination City *</label>
              <input
                type="text"
                required
                className="form-control"
                value={createForm.destinationCity}
                onChange={(e) => setCreateForm({ ...createForm, destinationCity: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pickup Address *</label>
              <input
                type="text"
                required
                className="form-control"
                value={createForm.pickupAddress}
                onChange={(e) => setCreateForm({ ...createForm, pickupAddress: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Address *</label>
              <input
                type="text"
                required
                className="form-control"
                value={createForm.destinationAddress}
                onChange={(e) => setCreateForm({ ...createForm, destinationAddress: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Service Type *</label>
              <select
                className="form-control"
                value={createForm.serviceType}
                onChange={(e) => setCreateForm({ ...createForm, serviceType: e.target.value })}
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
            <div className="form-group">
              <label className="form-label">Moving Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={createForm.movingDate}
                onChange={(e) => setCreateForm({ ...createForm, movingDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Quotation Amount (₹) *</label>
              <input
                type="number"
                min={0}
                required
                className="form-control"
                value={createForm.quoteAmount}
                onChange={(e) => setCreateForm({ ...createForm, quoteAmount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Paid Amount (₹)</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={createForm.paidAmount}
                onChange={(e) => setCreateForm({ ...createForm, paidAmount: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBookings;

