import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, Eye, Calendar, MapPin, IndianRupee, MessageSquare } from 'lucide-react';
import { enquiryAPI } from '../../services/api';
import { Badge, Modal, LoadingSpinner } from '../../components/CommonUI';

export const CustomerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    enquiryAPI.getMy()
      .then((res) => {
        if (res.data?.success) {
          setEnquiries(res.data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading enquiries..." />;

  const filtered = enquiries.filter((e) => {
    if (statusFilter === 'All') return true;
    return e.status === statusFilter;
  });

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>My Quotation Requests</h2>
          <p>Review submitted moving quotes, check status, and view relocation estimates</p>
        </div>
        <Link to="/quote" className="btn btn-primary">
          <PlusCircle size={16} /> New Quote Request
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Status:</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'New', 'Contacted', 'Quotation Sent', 'Converted', 'Closed'].map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${statusFilter === s ? 'btn-navy' : 'btn-outline'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <FileText size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Enquiries Found</h3>
          <p style={{ marginTop: '0.5rem' }}>You have no quotation enquiries matching the selected filter.</p>
          <Link to="/quote" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Request Free Quote
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Enquiry #</th>
                <th>Service</th>
                <th>Route</th>
                <th>Moving Date</th>
                <th>Status</th>
                <th>Quotation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enq) => (
                <tr key={enq._id}>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>{enq.enquiryNumber}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{enq.serviceType}</td>
                  <td>
                    {enq.pickupCity} → {enq.destinationCity}
                  </td>
                  <td>{new Date(enq.movingDate).toLocaleDateString()}</td>
                  <td><Badge status={enq.status} /></td>
                  <td>
                    {enq.quoteAmount > 0 ? (
                      <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                        ₹{enq.quoteAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Under Review</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedEnquiry(enq)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      <Modal
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        title={`Quotation Enquiry Details: ${selectedEnquiry?.enquiryNumber}`}
        footer={
          <button type="button" className="btn btn-navy btn-sm" onClick={() => setSelectedEnquiry(null)}>
            Close
          </button>
        }
      >
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Status</span>
                <Badge status={selectedEnquiry.status} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Quotation Estimate</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {selectedEnquiry.quoteAmount > 0 ? `₹${selectedEnquiry.quoteAmount.toLocaleString()}` : 'Awaiting Quote'}
                </span>
              </div>
            </div>

            {selectedEnquiry.customerResponse && (
              <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#0369A1', marginBottom: '0.25rem' }}>
                  <MessageSquare size={16} /> Relocation Team Response:
                </strong>
                <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {selectedEnquiry.customerResponse}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>Service Type:</strong>
                <span>{selectedEnquiry.serviceType} ({selectedEnquiry.propertyType || 'General'})</span>
              </div>
              <div>
                <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>Moving Date:</strong>
                <span>{new Date(selectedEnquiry.movingDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>Pickup Location:</strong>
              <span>{selectedEnquiry.pickupAddress}, {selectedEnquiry.pickupCity}</span>
            </div>

            <div>
              <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>Destination Location:</strong>
              <span>{selectedEnquiry.destinationAddress}, {selectedEnquiry.destinationCity}</span>
            </div>

            {selectedEnquiry.message && (
              <div>
                <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>Additional Notes / Requirements:</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedEnquiry.message}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerEnquiries;

