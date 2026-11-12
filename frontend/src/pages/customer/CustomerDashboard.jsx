import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CalendarCheck, Clock, CheckCircle2, ArrowRight, PlusCircle } from 'lucide-react';
import { enquiryAPI, bookingAPI } from '../../services/api';
import { StatCard, Badge, LoadingSpinner } from '../../components/CommonUI';

export const CustomerDashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([enquiryAPI.getMy(), bookingAPI.getMy()])
      .then(([enqRes, bookRes]) => {
        if (enqRes.data?.success) setEnquiries(enqRes.data.data || []);
        if (bookRes.data?.success) setBookings(bookRes.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load customer dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const pendingEnquiries = enquiries.filter((e) => ['New', 'Contacted', 'Negotiation'].includes(e.status)).length;
  const activeBookings = bookings.filter((b) => ['Confirmed', 'Packing', 'In Transit', 'Out for Delivery'].includes(b.status)).length;
  const completedBookings = bookings.filter((b) => b.status === 'Delivered').length;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>Account Overview</h2>
          <p>Track your relocation enquiries, view quotes, and check active bookings</p>
        </div>
        <Link to="/quote" className="btn btn-primary">
          <PlusCircle size={16} /> Request New Moving Quote
        </Link>
      </div>

      {/* Real Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Enquiries" value={enquiries.length} icon={FileText} />
        <StatCard title="Pending Review" value={pendingEnquiries} icon={Clock} color="orange" />
        <StatCard title="Active Moves" value={activeBookings} icon={CalendarCheck} color="navy" />
        <StatCard title="Completed Moves" value={completedBookings} icon={CheckCircle2} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Recent Enquiries */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Recent Quotation Requests</h3>
            <Link to="/account/enquiries" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)' }}>
              View All ({enquiries.length}) →
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p>No quotation enquiries submitted yet.</p>
              <Link to="/quote" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Request Free Quote
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {enquiries.slice(0, 4).map((enq) => (
                <div
                  key={enq._id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', display: 'block' }}>
                      {enq.enquiryNumber}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {enq.serviceType} • {enq.pickupCity} → {enq.destinationCity}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge status={enq.status} />
                    {enq.quoteAmount > 0 && (
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                        ₹{enq.quoteAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Active & Past Bookings</h3>
            <Link to="/account/bookings" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-orange)' }}>
              View All ({bookings.length}) →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p>No confirmed bookings yet.</p>
              <span style={{ fontSize: '0.8125rem' }}>
                Once your quotation enquiry is approved and scheduled, it will appear here with live tracking.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings.slice(0, 4).map((bk) => (
                <div
                  key={bk._id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', display: 'block' }}>
                      {bk.bookingNumber}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Moving Date: {new Date(bk.movingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge status={bk.status} />
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Payment: {bk.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

