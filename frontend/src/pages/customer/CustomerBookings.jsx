import React, { useState, useEffect } from 'react';
import { CalendarCheck, Eye, Truck, CheckCircle2, Clock, MapPin, IndianRupee } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { Badge, Modal, LoadingSpinner } from '../../components/CommonUI';

const TRACKING_STAGES = [
  'Confirmed',
  'Packing',
  'In Transit',
  'Out for Delivery',
  'Delivered',
];

export const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    bookingAPI.getMy()
      .then((res) => {
        if (res.data?.success) {
          setBookings(res.data.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading bookings..." />;

  const getStageIndex = (status) => {
    return TRACKING_STAGES.indexOf(status);
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>My Relocation Bookings</h2>
          <p>Track your ongoing moves, inspect consignment statuses, and view schedule details</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
          <CalendarCheck size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Confirmed Bookings Yet</h3>
          <p style={{ marginTop: '0.5rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem auto' }}>
            When our team prepares your quotation and you confirm the moving schedule, your booking will appear here with live tracking milestones.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Service</th>
                <th>Route</th>
                <th>Scheduled Date</th>
                <th>Tracking Status</th>
                <th>Quotation Amount</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((bk) => (
                <tr key={bk._id}>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>{bk.bookingNumber}</strong>
                  </td>
                  <td>{bk.serviceType}</td>
                  <td>{bk.pickupCity} → {bk.destinationCity}</td>
                  <td>{new Date(bk.movingDate).toLocaleDateString()}</td>
                  <td><Badge status={bk.status} /></td>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>
                      ₹{(bk.quoteAmount || 0).toLocaleString()}
                    </strong>
                  </td>
                  <td><Badge status={bk.paymentStatus} /></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedBooking(bk)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Eye size={14} /> Track Move
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Details & Timeline Modal */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title={`Move Tracking: ${selectedBooking?.bookingNumber}`}
        footer={
          <button type="button" className="btn btn-navy btn-sm" onClick={() => setSelectedBooking(null)}>
            Close
          </button>
        }
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9375rem' }}>
            {/* Visual Tracking Stage Bar */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '1rem' }}>
                Relocation Progress
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TRACKING_STAGES.length}, 1fr)`, gap: '0.5rem', textAlign: 'center' }}>
                {TRACKING_STAGES.map((stage, idx) => {
                  const currentIdx = getStageIndex(selectedBooking.status);
                  const isPassed = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isPassed ? 'var(--brand-orange)' : '#E2E8F0',
                          color: isPassed ? '#FFFFFF' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--brand-orange)' : isPassed ? 'var(--brand-navy)' : 'var(--text-muted)',
                        }}
                      >
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Estimate</span>
                <strong style={{ fontSize: '1.125rem', color: 'var(--brand-navy)' }}>
                  ₹{(selectedBooking.quoteAmount || 0).toLocaleString()}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Paid Amount</span>
                <strong style={{ fontSize: '1.125rem', color: 'var(--success)' }}>
                  ₹{(selectedBooking.paidAmount || 0).toLocaleString()}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Payment Status</span>
                <Badge status={selectedBooking.paymentStatus} />
              </div>
            </div>

            {/* Addresses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <strong style={{ color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} color="var(--brand-orange)" /> Pickup Origin
                </strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedBooking.pickupAddress}, {selectedBooking.pickupCity}
                </p>
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <strong style={{ color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} color="var(--brand-orange)" /> Delivery Destination
                </strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedBooking.destinationAddress}, {selectedBooking.destinationCity}
                </p>
              </div>
            </div>

            {/* Tracking Log Updates */}
            {selectedBooking.trackingUpdates && selectedBooking.trackingUpdates.length > 0 && (
              <div>
                <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                  Live Transit Updates
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedBooking.trackingUpdates.map((update, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--brand-navy)' }}>{update.status}</strong>
                        {update.remarks && <span> — {update.remarks}</span>}
                        {update.location && <span style={{ color: 'var(--brand-orange)' }}> ({update.location})</span>}
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerBookings;

