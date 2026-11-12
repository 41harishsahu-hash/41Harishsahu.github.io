import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  CalendarCheck,
  Send,
  Plus,
} from 'lucide-react';
import { enquiryAPI } from '../../services/api';
import { Badge, Modal, Alert, LoadingSpinner, Pagination } from '../../components/CommonUI';

const STATUS_LIST = ['All', 'New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Converted', 'Rejected', 'Closed'];

export const AdminEnquiries = () => {
  const [searchParams] = useSearchParams();
  const directId = searchParams.get('id');

  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [serviceType, setServiceType] = useState('All');

  // Modal / Selected Enquiry
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('New');
  const [updateQuote, setUpdateQuote] = useState(0);
  const [customerResponse, setCustomerResponse] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await enquiryAPI.getAll({
        search,
        status: status === 'All' ? undefined : status,
        serviceType: serviceType === 'All' ? undefined : serviceType,
        page,
        limit: 10,
      });

      if (res.data?.success) {
        setEnquiries(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);

        if (directId) {
          const matched = res.data.data.find((e) => e._id === directId);
          if (matched) {
            openEnquiryModal(matched);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, serviceType, page, directId]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const openEnquiryModal = (enq) => {
    setActiveEnquiry(enq);
    setUpdateStatus(enq.status);
    setUpdateQuote(enq.quoteAmount || 0);
    setCustomerResponse(enq.customerResponse || '');
    setInternalNote('');
    setMessage(null);
  };

  const handleUpdateEnquiry = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await enquiryAPI.update(activeEnquiry._id, {
        status: updateStatus,
        quoteAmount: Number(updateQuote),
        customerResponse,
        internalNote,
      });

      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Enquiry updated successfully!' });
        setActiveEnquiry(res.data.data);
        fetchEnquiries();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update enquiry' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToBooking = async () => {
    if (!window.confirm(`Convert enquiry #${activeEnquiry.enquiryNumber} into a confirmed booking?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await enquiryAPI.convertToBooking(activeEnquiry._id, {
        quoteAmount: Number(updateQuote),
      });

      if (res.data?.success) {
        alert(`Booking #${res.data.data?.bookingNumber} created successfully!`);
        setActiveEnquiry(null);
        fetchEnquiries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to convert enquiry to booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }

    try {
      await enquiryAPI.delete(id);
      setActiveEnquiry(null);
      fetchEnquiries();
    } catch (err) {
      alert('Failed to delete enquiry');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Enquiries Management</h2>
          <p>Review customer quotation requests, send estimates, and convert to bookings</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, phone, enquiry #, or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-control"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading enquiries..." />
      ) : enquiries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <FileText size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Enquiries Found</h3>
          <p>There are no customer enquiries matching your search filters.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enquiry #</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Route</th>
                  <th>Moving Date</th>
                  <th>Status</th>
                  <th>Quote</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq._id}>
                    <td>
                      <strong style={{ color: 'var(--brand-navy)' }}>{enq.enquiryNumber}</strong>
                    </td>
                    <td>
                      <strong>{enq.name}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{enq.mobile}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enq.email}</div>
                    </td>
                    <td>{enq.serviceType}</td>
                    <td>{enq.pickupCity} → {enq.destinationCity}</td>
                    <td>{new Date(enq.movingDate).toLocaleDateString()}</td>
                    <td><Badge status={enq.status} /></td>
                    <td>
                      {enq.quoteAmount > 0 ? (
                        <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          ₹{enq.quoteAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openEnquiryModal(enq)}
                          title="View and update enquiry"
                        >
                          <Eye size={14} /> Manage
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--danger)', background: 'none', border: '1px solid #FECACA' }}
                          onClick={() => handleDeleteEnquiry(enq._id)}
                          title="Delete enquiry"
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

      {/* Enquiry Detail & Action Modal */}
      <Modal
        isOpen={Boolean(activeEnquiry)}
        onClose={() => setActiveEnquiry(null)}
        title={`Manage Enquiry #${activeEnquiry?.enquiryNumber}`}
      >
        {activeEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem' }}>
            {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

            {/* Customer & Route Details */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer</span>
                  <strong>{activeEnquiry.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone / Email</span>
                  <span>{activeEnquiry.mobile} | {activeEnquiry.email}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Origin</span>
                  <span>{activeEnquiry.pickupAddress}, {activeEnquiry.pickupCity}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Destination</span>
                  <span>{activeEnquiry.destinationAddress}, {activeEnquiry.destinationCity}</span>
                </div>
              </div>

              {activeEnquiry.message && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer Message</span>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>{activeEnquiry.message}</p>
                </div>
              )}
            </div>

            {/* Convert to Booking CTA */}
            {activeEnquiry.status !== 'Converted' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ color: '#166534', display: 'block' }}>Ready to Schedule Move?</strong>
                  <span style={{ fontSize: '0.8125rem', color: '#15803D' }}>Convert this enquiry directly into a confirmed booking.</span>
                </div>
                <button
                  type="button"
                  onClick={handleConvertToBooking}
                  disabled={actionLoading}
                  className="btn btn-sm"
                  style={{ backgroundColor: 'var(--success)', color: '#FFFFFF', border: 'none' }}
                >
                  <CalendarCheck size={14} /> Convert to Booking
                </button>
              </div>
            )}

            {/* Update Form */}
            <form onSubmit={handleUpdateEnquiry}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="enqStatus">Update Status</label>
                  <select
                    id="enqStatus"
                    className="form-control"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    {STATUS_LIST.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="enqQuote">Quotation Amount (₹)</label>
                  <input
                    type="number"
                    id="enqQuote"
                    min={0}
                    className="form-control"
                    value={updateQuote}
                    onChange={(e) => setUpdateQuote(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="customerResponse">Customer-Visible Note / Quotation Breakdown</label>
                <textarea
                  id="customerResponse"
                  rows={2}
                  className="form-control"
                  placeholder="Notes visible to customer in their account dashboard..."
                  value={customerResponse}
                  onChange={(e) => setCustomerResponse(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="internalNote">Add Internal Admin Note (Private)</label>
                <input
                  type="text"
                  id="internalNote"
                  className="form-control"
                  placeholder="e.g. Called customer at 3 PM. Agreed on 15k with vehicle insurance."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>

              {/* Internal Notes History */}
              {activeEnquiry.internalNotes && activeEnquiry.internalNotes.length > 0 && (
                <div style={{ marginBottom: '1rem', maxHeight: '120px', overflowY: 'auto', backgroundColor: '#FAFAFA', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                    Note History:
                  </span>
                  {activeEnquiry.internalNotes.map((n, i) => (
                    <div key={i} style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <strong style={{ color: 'var(--brand-navy)' }}>{n.addedBy}: </strong>
                      <span>{n.note}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({new Date(n.createdAt).toLocaleDateString()})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveEnquiry(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                >
                  {actionLoading ? 'Saving...' : 'Save Enquiry Updates'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminEnquiries;

